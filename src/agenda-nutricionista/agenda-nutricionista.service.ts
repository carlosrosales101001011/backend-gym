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
    private readonly fullTextSearchService: FullTextSearchService
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

  async create(createAgendaNutricionistaDto: CreateAgendaNutricionistaDto) {
    const labels = await this.getLabels(createAgendaNutricionistaDto);
    try {
      const cita = this.agendaRepository.create({ ...createAgendaNutricionistaDto, ...labels });
      const { id } = await this.agendaRepository.save(cita);
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
    await this.findOne(id);
    const labels = await this.getLabels(updateAgendaNutricionistaDto);
    try {
      await this.agendaRepository.update(id, { ...updateAgendaNutricionistaDto, ...labels });
      return { ok: true, msg: 'actualizado con exito' };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  /** Borrado lógico */
  async remove(id: number) {
    await this.findOne(id);
    await this.agendaRepository.update(id, { flag: false });
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
