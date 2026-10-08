import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonaEventosAsistenciaDto } from './dto/create-persona_eventos_asistencia.dto';
import { UpdatePersonaEventosAsistenciaDto } from './dto/update-persona_eventos_asistencia.dto';
import { PersonaEventosAsistencia } from './entities/persona_eventos_asistencia.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BuscarAsistenciasDto } from './dto/buscar-asistencias.dto';
import { ReporteAsistenciaClientesDto } from './dto/reporte-asistencia-clientes.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import type { UsuarioCreador } from 'src/user/decorator/usuario-creador.decorator';

@Injectable()
export class PersonaEventosAsistenciaService {
  private readonly logger = new Logger('PersonaEventosAsistenciaService')
  constructor(
    @InjectRepository(PersonaEventosAsistencia)
    private readonly personaEventosAsistenciaRepository: Repository<PersonaEventosAsistencia>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getLabels(dto: {
    id_persona?: number;
    id_tipo_evento?: number;
  }) {
    const labels: Partial<PersonaEventosAsistencia> = {};

    if (dto.id_persona !== undefined && dto.id_persona !== null) {
      const persona = await this.personaRepository.findOneBy({ id: dto.id_persona });
      if (persona) {
        labels.label_nombres_apellidos_persona = `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
      }
    }

    if (dto.id_tipo_evento !== undefined && dto.id_tipo_evento !== null) {
      const terminologia = await this.terminologiaRepository.findOneBy({ id: dto.id_tipo_evento });
      labels.label_tipo_evento = terminologia?.valor;
    }

    return labels;
  }

  /** creador: usuario logueado que registra la asistencia (lo entrega el guard con @UsuarioCreador) */
  async create(createPersonaEventosAsistenciaDto: CreatePersonaEventosAsistenciaDto, creador: UsuarioCreador) {
    try {
      const labels = await this.getLabels(createPersonaEventosAsistenciaDto);
      const evento = this.personaEventosAsistenciaRepository.create({
        ...createPersonaEventosAsistenciaDto,
        ...labels,
        ...creador,
        // Momento del registro: fecha y hora actuales del servidor
        fecha_registro: new Date(),
      })
      await this.personaEventosAsistenciaRepository.save(evento)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.personaEventosAsistenciaRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
      },
      order: {
        fecha_registro: 'DESC'
      }
    });

    return {
      lista,
      total
    }
  }

  async findOne(id: number) {
    return await this.personaEventosAsistenciaRepository.findOne({where: {id, flag: true}, select: {id: true, id_persona: true, label_nombres_apellidos_persona: false, id_tipo_evento: true, label_tipo_evento: false, deviceSN: true, fecha_registro: true}});
  }

  async update(id: number, updatePersonaEventosAsistenciaDto: UpdatePersonaEventosAsistenciaDto) {
    const labels = await this.getLabels(updatePersonaEventosAsistenciaDto);
    const evento = await this.personaEventosAsistenciaRepository.preload({
      id,
      ...updatePersonaEventosAsistenciaDto,
      ...labels
    });
    if (!evento) throw new BadRequestException(`PersonaEventosAsistencia with id ${id} not found`);
    try {
      await this.personaEventosAsistenciaRepository.save(evento);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.personaEventosAsistenciaRepository.update(id, {flag: false});
  }

  /**
   * Reporte de asistencias de clientes (persona id_tipo 2) en el rango de fechas, cada una con el programa y
   * horario de su membresía: el seguimiento vigente ese día (el de vencimiento más cercano desde esa fecha;
   * si ninguno lo estaba, el último) -> su venta -> el detalle de la membresía.
   * id_programa filtra por programa; horario busca ese texto dentro del horario (ej. "07:00").
   */
  async reporteClientes({ fecha_inicio, fecha_fin, id_programa, horario }: ReporteAsistenciaClientesDto) {
    const params: (string | number)[] = [];
    const condiciones = ['a.flag = 1'];
    if (fecha_inicio) { params.push(fecha_inicio); condiciones.push(`CAST(a.fecha_registro AS date) >= @${params.length - 1}`); }
    if (fecha_fin) { params.push(fecha_fin); condiciones.push(`CAST(a.fecha_registro AS date) <= @${params.length - 1}`); }
    if (id_programa) { params.push(id_programa); condiciones.push(`d.id_programa = @${params.length - 1}`); }
    if (horario?.trim()) { params.push(`%${horario.trim()}%`); condiciones.push(`d.label_horario LIKE @${params.length - 1}`); }

    return this.personaEventosAsistenciaRepository.query(`
      SELECT
        a.id, a.id_persona, a.label_nombres_apellidos_persona, a.fecha_registro,
        a.id_usercreated, a.label_nombres_apellidos_usercreated,
        s.id AS id_seguimiento, s.fecha_vencimiento, s.id_venta,
        d.id_programa, d.label_programa, d.id_horario, d.label_horario, d.label_plan
      FROM persona_eventos_asistencia a
      INNER JOIN persona p ON p.id = a.id_persona AND p.id_tipo = 2
      OUTER APPLY (
        SELECT TOP 1 ms.id, ms.fecha_vencimiento, ms.id_venta
        FROM membresia_seguimiento ms
        WHERE ms.id_cli = a.id_persona AND ms.flag = 1
        ORDER BY
          CASE WHEN ms.fecha_vencimiento >= CAST(a.fecha_registro AS date) THEN 0 ELSE 1 END,
          CASE WHEN ms.fecha_vencimiento >= CAST(a.fecha_registro AS date) THEN ms.fecha_vencimiento END ASC,
          ms.fecha_vencimiento DESC
      ) s
      OUTER APPLY (
        SELECT TOP 1 dm.id_programa, dm.label_programa, dm.id_horario, dm.label_horario, dm.label_plan
        FROM detalleventa_membresia dm
        WHERE dm.id_venta = s.id_venta AND dm.flag = 1
      ) d
      WHERE ${condiciones.join(' AND ')}
      ORDER BY a.fecha_registro DESC
    `, params);
  }

  /**
   * Resumen del rango (fecha de la asistencia): clientes y colaboradores distintos que asistieron y clientes con
   * membresía vigente en el rango que no asistieron (ver resumenReporteClientes).
   */
  async resumen({ fecha_inicio, fecha_fin }: ReporteAsistenciaClientesDto) {
    const params: string[] = [];
    const condiciones = ['a.flag = 1'];
    if (fecha_inicio) { params.push(fecha_inicio); condiciones.push(`CAST(a.fecha_registro AS date) >= @${params.length - 1}`); }
    if (fecha_fin) { params.push(fecha_fin); condiciones.push(`CAST(a.fecha_registro AS date) <= @${params.length - 1}`); }

    const [[asistidos], { clientes_sin_asistir }] = await Promise.all([
      this.personaEventosAsistenciaRepository.query(`
        SELECT
          COUNT(DISTINCT CASE WHEN p.id_tipo = 2 THEN a.id_persona END) AS clientes_asistidos,
          COUNT(DISTINCT CASE WHEN p.id_tipo = 1 THEN a.id_persona END) AS colaboradores_asistidos
        FROM persona_eventos_asistencia a
        INNER JOIN persona p ON p.id = a.id_persona
        WHERE ${condiciones.join(' AND ')}
      `, params),
      this.resumenReporteClientes({ fecha_inicio, fecha_fin }),
    ]);
    return {
      clientes_asistidos: Number(asistidos?.clientes_asistidos ?? 0),
      clientes_sin_asistir,
      colaboradores_asistidos: Number(asistidos?.colaboradores_asistidos ?? 0),
    };
  }

  /**
   * Clientes sin asistir: clientes (persona id_tipo 2) con una membresía vigente en el rango (vence desde la fecha
   * de inicio y empezó hasta la fecha de fin), del programa elegido si hay, que no registraron asistencia en el rango.
   */
  async resumenReporteClientes({ fecha_inicio, fecha_fin, id_programa }: ReporteAsistenciaClientesDto) {
    const params: (string | number)[] = [];
    const condiciones = ['ms.flag = 1'];
    const enRango: string[] = ['a.id_persona = ms.id_cli', 'a.flag = 1'];
    if (fecha_inicio) {
      params.push(fecha_inicio);
      condiciones.push(`ms.fecha_vencimiento >= @${params.length - 1}`);
      enRango.push(`CAST(a.fecha_registro AS date) >= @${params.length - 1}`);
    }
    if (fecha_fin) {
      params.push(fecha_fin);
      condiciones.push(`(d.fecha_inicio IS NULL OR CAST(d.fecha_inicio AS date) <= @${params.length - 1})`);
      enRango.push(`CAST(a.fecha_registro AS date) <= @${params.length - 1}`);
    }
    if (id_programa) { params.push(id_programa); condiciones.push(`d.id_programa = @${params.length - 1}`); }

    const [fila] = await this.personaEventosAsistenciaRepository.query(`
      SELECT COUNT(DISTINCT ms.id_cli) AS clientes_sin_asistir
      FROM membresia_seguimiento ms
      INNER JOIN persona p ON p.id = ms.id_cli AND p.id_tipo = 2 AND p.flag = 1
      OUTER APPLY (
        SELECT TOP 1 dm.id_programa, dm.fecha_inicio
        FROM detalleventa_membresia dm
        WHERE dm.id_venta = ms.id_venta AND dm.flag = 1
      ) d
      WHERE ${condiciones.join(' AND ')}
        AND NOT EXISTS (SELECT 1 FROM persona_eventos_asistencia a WHERE ${enRango.join(' AND ')})
    `, params);
    return { clientes_sin_asistir: Number(fila?.clientes_sin_asistir ?? 0) };
  }

  /** Búsqueda paginada, la más reciente primero; fecha_inicio / fecha_fin (yyyy-mm-dd) acotan la fecha de registro */
  async findSearch(q: string,
    buscarDto: BuscarAsistenciasDto
  ){
    const { offset, show, fecha_inicio, fecha_fin } = buscarDto;

    if (!q || q.trim().length===0) {
      // Sin texto: solo el rango de fechas (comparando la fecha, sin la hora)
      const consulta = this.personaEventosAsistenciaRepository
        .createQueryBuilder('a')
        .where('a.flag = 1')
        .orderBy('a.fecha_registro', 'DESC')
        .skip(offset)
        .take(show);
      if (fecha_inicio) consulta.andWhere('CAST(a.fecha_registro AS date) >= :fecha_inicio', { fecha_inicio });
      if (fecha_fin) consulta.andWhere('CAST(a.fecha_registro AS date) <= :fecha_fin', { fecha_fin });
      const [items, total] = await consulta.getManyAndCount();
      return { items, total }
    }
    const { items, total } = await this.fullTextSearchService.search(
      PersonaEventosAsistencia,
      [
        'label_nombres_apellidos_persona',
        'label_tipo_evento',
        'deviceSN',
        'label_nombres_apellidos_usercreated'
      ],
      q,
      {
        take: show,
        skip: offset,
        // Las eliminadas (flag 0) no se muestran
        where: { flag: true },
        rangosFecha: { fecha_registro: { desde: fecha_inicio, hasta: fecha_fin } },
      }
    );
    return {
      items,
      total
    }
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
