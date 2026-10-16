import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAgendaNutricionistaDto } from './dto/create-agenda-nutricionista.dto';
import { UpdateAgendaNutricionistaDto } from './dto/update-agenda-nutricionista.dto';
import { AgendaNutricionista } from './entities/agenda-nutricionista.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { AgendaNutricionistaGateway } from './agenda-nutricionista.gateway';
import { BuscarAgendaRangoDto } from './dto/buscar-agenda-rango.dto';

const ID_TIPO_COLABORADOR = 1;
const ID_TIPO_CLIENTE = 2;

const nombreCompleto = (persona: Persona) =>
  `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();

@Injectable()
export class AgendaNutricionistaService {
  private readonly logger = new Logger('AgendaNutricionistaService')
  constructor(
    @InjectRepository(AgendaNutricionista)
    private readonly agendaRepository: Repository<AgendaNutricionista>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService,
    private readonly agendaGateway: AgendaNutricionistaGateway,
  ){}

  /**
   * Labels a partir de los ids que vienen (los que no vienen no se tocan). Valida que el cliente sea cliente,
   * el nutricionista sea colaborador y el estado exista en la terminología.
   */
  private async getLabels(dto: { id_cli?: number, id_empl?: number, id_estado?: number }) {
    const labels: Partial<AgendaNutricionista> = {};

    if (dto.id_cli !== undefined) {
      const cliente = await this.personaRepository.findOneBy({ id: dto.id_cli, id_tipo: ID_TIPO_CLIENTE, flag: true });
      if (!cliente) throw new BadRequestException('El cliente no existe');
      labels.label_nombres_apellidos_cli = nombreCompleto(cliente);
    }
    if (dto.id_empl !== undefined) {
      const empleado = await this.personaRepository.findOneBy({ id: dto.id_empl, id_tipo: ID_TIPO_COLABORADOR, flag: true });
      if (!empleado) throw new BadRequestException('El nutricionista (colaborador) no existe');
      labels.label_nombres_apellidos_empl = nombreCompleto(empleado);
    }
    if (dto.id_estado !== undefined) {
      const estado = await this.terminologiaRepository.findOneBy({ id: dto.id_estado });
      if (!estado) throw new BadRequestException('El estado no existe');
      labels.label_estado = estado.valor;
    }
    return labels;
  }

  /** "HH:mm" a minutos desde las 00:00 */
  private aMinutos(hora: string): number {
    const [h, m] = hora.slice(0, 5).split(':').map(Number);
    return h * 60 + m;
  }

  /**
   * Misma regla que el calendario: una cita no se puede cruzar con otra cita activa del mismo día
   * (terminar a la hora en que empieza la otra sí se permite). excluirId: la cita que se edita.
   */
  private async validarCruce(fecha: string, hora_inicio: string, duracionxmin: number, excluirId = 0) {
    const inicio = this.aMinutos(hora_inicio);
    const fin = inicio + duracionxmin;
    const [cruce]: { label_nombres_apellidos_cli: string | null, inicio: number, duracionxmin: number }[] = await this.agendaRepository.query(`
      SELECT TOP 1 label_nombres_apellidos_cli, DATEDIFF(minute, '00:00', hora_inicio) AS inicio, duracionxmin
      FROM agenda_nutricionista
      WHERE flag = 1 AND fecha = @0 AND id <> @1
        AND DATEDIFF(minute, '00:00', hora_inicio) < @2
        AND DATEDIFF(minute, '00:00', hora_inicio) + duracionxmin > @3
    `, [fecha.slice(0, 10), excluirId, fin, inicio]);
    if (cruce) {
      const hhmm = (minutos: number) => `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
      throw new BadRequestException(
        `Se cruza con el evento de ${cruce.label_nombres_apellidos_cli ?? ''} (${hhmm(cruce.inicio)} - ${hhmm(cruce.inicio + cruce.duracionxmin)})`,
      );
    }
  }

  async create(createAgendaNutricionistaDto: CreateAgendaNutricionistaDto) {
    const labels = await this.getLabels(createAgendaNutricionistaDto);
    const { fecha, hora_inicio, duracionxmin } = createAgendaNutricionistaDto;
    await this.validarCruce(fecha, hora_inicio, duracionxmin);
    try {
      const cita = this.agendaRepository.create({ ...createAgendaNutricionistaDto, ...labels });
      const { id } = await this.agendaRepository.save(cita);
      // Tras el save el id siempre viene (en la entidad es opcional solo para el create)
      this.agendaGateway.notificarCambio({ accion: 'crear', id: id! });
      return { ok: true, msg: 'creado con exito', id };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [lista, total] = await this.agendaRepository.findAndCount({
      take: show,
      skip: offset,
      where: { flag: true },
      order: { fecha: 'DESC', hora_inicio: 'ASC' },
    });
    return { lista, total };
  }

  /**
   * Citas activas entre fecha_inicio y fecha_fin (ambas inclusive), en orden de fecha y hora.
   * Con q se ignora el rango: todas las citas de los clientes cuyo nombre contiene q (sin distinguir tildes ni mayúsculas).
   */
  async findRango({ fecha_inicio, fecha_fin, q }: BuscarAgendaRangoDto) {
    const texto = q?.trim();
    if (!texto && (!fecha_inicio || !fecha_fin)) {
      throw new BadRequestException('fecha_inicio y fecha_fin son obligatorios (o q para buscar un cliente)');
    }
    const consulta = this.agendaRepository
      .createQueryBuilder('c')
      .where('c.flag = 1')
      .orderBy('c.fecha', 'ASC')
      .addOrderBy('c.hora_inicio', 'ASC');
    if (texto) {
      consulta.andWhere('c.label_nombres_apellidos_cli COLLATE Latin1_General_CI_AI LIKE :q', { q: `%${texto}%` });
    } else {
      consulta.andWhere('c.fecha >= :fecha_inicio AND c.fecha <= :fecha_fin', { fecha_inicio, fecha_fin });
    }
    const [lista, total] = await consulta.getManyAndCount();
    return { lista, total };
  }

  /** Citas activas de un cliente, la más reciente primero (fecha yyyy-mm-dd, hora HH:mm) */
  async findByIdCli(id_cli: number) {
    return this.agendaRepository.query(`
      SELECT id, id_cli, id_empl, label_nombres_apellidos_empl, duracionxmin, id_estado, label_estado,
        CONVERT(varchar(10), fecha, 23) AS fecha,
        CONVERT(varchar(5), hora_inicio, 108) AS hora_inicio
      FROM agenda_nutricionista
      WHERE id_cli = @0 AND flag = 1
      ORDER BY fecha DESC, hora_inicio DESC
    `, [id_cli]);
  }

  async findOne(id: number) {
    const cita = await this.agendaRepository.findOne({ where: { id, flag: true } });
    if (!cita) throw new NotFoundException(`Cita ${id} no encontrada`);
    return cita;
  }

  async update(id: number, updateAgendaNutricionistaDto: UpdateAgendaNutricionistaDto) {
    const actual = await this.findOne(id);
    const labels = await this.getLabels(updateAgendaNutricionistaDto);
    // Con los valores que quedarán (los que no vienen se mantienen)
    await this.validarCruce(
      String(updateAgendaNutricionistaDto.fecha ?? actual.fecha),
      String(updateAgendaNutricionistaDto.hora_inicio ?? actual.hora_inicio),
      updateAgendaNutricionistaDto.duracionxmin ?? actual.duracionxmin!,
      id,
    );
    try {
      await this.agendaRepository.update(id, { ...updateAgendaNutricionistaDto, ...labels });
      this.agendaGateway.notificarCambio({ accion: 'editar', id });
      return { ok: true, msg: 'actualizado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /** Borrado lógico */
  async remove(id: number) {
    await this.findOne(id);
    await this.agendaRepository.update(id, { flag: false });
    this.agendaGateway.notificarCambio({ accion: 'eliminar', id });
    return { ok: true, msg: 'eliminado con exito' };
  }

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;
    if (!q || q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return { items: lista, total };
    }
    return this.fullTextSearchService.search(
      AgendaNutricionista,
      ['label_nombres_apellidos_cli', 'label_nombres_apellidos_empl', 'label_estado', 'fecha'],
      q,
      { take: show, skip: offset, where: { flag: true } },
    );
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('No se pudo guardar la cita');
  }
}
