import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePersonaEventosAsistenciaDto } from './dto/create-persona_eventos_asistencia.dto';
import { UpdatePersonaEventosAsistenciaDto } from './dto/update-persona_eventos_asistencia.dto';
import { PersonaEventosAsistencia } from './entities/persona_eventos_asistencia.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { avataresPorPersona } from 'src/persona/avatar-persona';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BuscarAsistenciasDto } from './dto/buscar-asistencias.dto';
import { ReporteAsistenciaClientesDto } from './dto/reporte-asistencia-clientes.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import type { UsuarioCreador } from 'src/user/decorator/usuario-creador.decorator';
import { diaLocal, finDiaLocal, inicioDiaLocal } from 'src/common/helpers/rango-dia-local';

/** Tipo de asistencia cuando no se envía: "Entrada" (terminología asistencia/tipo/persona) */
export const ID_SUBTIPO_ASISTENCIA_POR_DEFECTO = 6141

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

  async onModuleInit() {
    // Las asistencias sin un tipo de asistencia/tipo/persona (anteriores a id_subtipo, o con 0) quedan como Entrada
    try {
      await this.personaEventosAsistenciaRepository.query(`
        UPDATE persona_eventos_asistencia
        SET id_subtipo = @0, label_subtipo = ISNULL((SELECT valor FROM terminologia WHERE id = @0), '')
        WHERE id_subtipo IS NULL
          OR id_subtipo NOT IN (SELECT id FROM terminologia WHERE entidad = 'asistencia' AND grupo = 'tipo' AND subgrupo = 'persona')
      `, [ID_SUBTIPO_ASISTENCIA_POR_DEFECTO]);
    } catch (error) {
      this.logger.error('No se pudo completar id_subtipo / label_subtipo de persona_eventos_asistencia', error);
    }
  }

  private async getLabels(dto: {
    id_persona?: number;
    id_tipo_evento?: number;
    id_subtipo?: number;
  }) {
    const labels: Partial<PersonaEventosAsistencia> = {};

    if (dto.id_persona !== undefined && dto.id_persona !== null) {
      const persona = await this.personaRepository.findOneBy({ id: dto.id_persona });
      if (persona) {
        labels.label_nombres_apellidos_persona = `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
      }
    }

    if (dto.id_subtipo !== undefined && dto.id_subtipo !== null) {
      const terminologia = await this.terminologiaRepository.findOneBy({ id: dto.id_subtipo });
      labels.label_subtipo = terminologia?.valor ?? '';
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
      // Sin tipo de asistencia (ej. las que llegan del dispositivo): Entrada
      const dto = { ...createPersonaEventosAsistenciaDto, id_subtipo: createPersonaEventosAsistenciaDto.id_subtipo || ID_SUBTIPO_ASISTENCIA_POR_DEFECTO };
      const labels = await this.getLabels(dto);
      const evento = this.personaEventosAsistenciaRepository.create({
        ...dto,
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

  /**
   * Asistencias de una persona, la más reciente primero, con la foto de quien la registró.
   * fecha_inicio / fecha_fin (yyyy-mm-dd, opcionales) acotan la fecha de registro a esos días de Perú, ambos inclusive.
   */
  async findByIdPersona(id_persona: number, { fecha_inicio, fecha_fin }: { fecha_inicio?: string, fecha_fin?: string } = {}) {
    const consulta = this.personaEventosAsistenciaRepository
      .createQueryBuilder('a')
      .where('a.flag = 1')
      .andWhere('a.id_persona = :id_persona', { id_persona })
      .orderBy('a.fecha_registro', 'DESC');
    if (fecha_inicio) consulta.andWhere('a.fecha_registro >= :desde', { desde: inicioDiaLocal(fecha_inicio) });
    if (fecha_fin) consulta.andWhere('a.fecha_registro < :hasta', { hasta: finDiaLocal(fecha_fin) });
    const [ lista, total ] = await consulta.getManyAndCount();
    return {
      lista: await this.conAvatares(lista),
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
    const params: (string | number | Date)[] = [];
    const condiciones = ['a.flag = 1'];
    if (fecha_inicio) { params.push(inicioDiaLocal(fecha_inicio)); condiciones.push(`a.fecha_registro >= @${params.length - 1}`); }
    if (fecha_fin) { params.push(finDiaLocal(fecha_fin)); condiciones.push(`a.fecha_registro < @${params.length - 1}`); }
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
    const params: Date[] = [];
    const condiciones = ['a.flag = 1'];
    if (fecha_inicio) { params.push(inicioDiaLocal(fecha_inicio)); condiciones.push(`a.fecha_registro >= @${params.length - 1}`); }
    if (fecha_fin) { params.push(finDiaLocal(fecha_fin)); condiciones.push(`a.fecha_registro < @${params.length - 1}`); }

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
   * Resumen de clientes (persona id_tipo 2) con una membresía vigente en el rango (vence desde la fecha de inicio y
   * empezó hasta la fecha de fin), del programa elegido si hay:
   * - clientes_sin_asistir: no registraron asistencia en el rango.
   * - clientes_en_riesgo / clientes_criticos: su última asistencia (hasta la fecha de fin, o hoy) fue hace 7–13 / ≥14 días.
   * - clientes_nunca_asistieron: no tienen ninguna asistencia.
   */
  async resumenReporteClientes(filtros: ReporteAsistenciaClientesDto) {
    const clientes = await this.clientesReporteClientes(filtros);
    return {
      clientes_sin_asistir: clientes.filter(c => c.sin_asistir).length,
      clientes_en_riesgo: clientes.filter(c => c.en_riesgo).length,
      clientes_criticos: clientes.filter(c => c.critico).length,
      clientes_nunca_asistieron: clientes.filter(c => c.nunca_asistio).length,
    };
  }

  /**
   * Clientes del resumen (ver resumenReporteClientes), cada uno con su última asistencia (hasta el día de referencia),
   * cuántas tuvo en el rango y en qué grupos del resumen entra. Ordenados por nombre.
   */
  async clientesReporteClientes({ fecha_inicio, fecha_fin, id_programa }: ReporteAsistenciaClientesDto) {
    const params: (string | number | Date)[] = [];
    const condiciones = ['ms.flag = 1'];
    // Asistencia (alias a) dentro del rango; sin fechas, cualquiera
    const enRango: string[] = ['1 = 1'];
    if (fecha_inicio) {
      params.push(fecha_inicio);
      condiciones.push(`ms.fecha_vencimiento >= @${params.length - 1}`);
      params.push(inicioDiaLocal(fecha_inicio));
      enRango.push(`a.fecha_registro >= @${params.length - 1}`);
    }
    if (fecha_fin) {
      params.push(fecha_fin);
      condiciones.push(`(d.fecha_inicio IS NULL OR CAST(d.fecha_inicio AS date) <= @${params.length - 1})`);
      params.push(finDiaLocal(fecha_fin));
      enRango.push(`a.fecha_registro < @${params.length - 1}`);
    }
    if (id_programa) { params.push(id_programa); condiciones.push(`d.id_programa = @${params.length - 1}`); }

    // Días sin asistir contados hasta el día de referencia (fecha de fin, o hoy), con límites en hora de Perú
    const DIA_MS = 24 * 60 * 60 * 1000;
    const referencia = inicioDiaLocal(fecha_fin || diaLocal(new Date()));
    const haceDias = (dias: number) => new Date(referencia.getTime() - dias * DIA_MS);
    params.push(new Date(referencia.getTime() + DIA_MS));
    const pFinReferencia = `@${params.length - 1}`;
    params.push(haceDias(13));
    const pHace13 = `@${params.length - 1}`;
    params.push(haceDias(6));
    const pHace6 = `@${params.length - 1}`;

    const filas: {
      id_persona: number, nombres: string | null, apellido_paterno: string | null, apellido_materno: string | null,
      ultima_asistencia: Date | null, asistencias_en_rango: number,
      sin_asistir: number, en_riesgo: number, critico: number, nunca_asistio: number,
    }[] = await this.personaEventosAsistenciaRepository.query(`
      WITH clientes AS (
        SELECT DISTINCT ms.id_cli
        FROM membresia_seguimiento ms
        INNER JOIN persona p ON p.id = ms.id_cli AND p.id_tipo = 2 AND p.flag = 1
        OUTER APPLY (
          SELECT TOP 1 dm.id_programa, dm.fecha_inicio
          FROM detalleventa_membresia dm
          WHERE dm.id_venta = ms.id_venta AND dm.flag = 1
        ) d
        WHERE ${condiciones.join(' AND ')}
      )
      SELECT
        c.id_cli AS id_persona, p.nombres, p.apellido_paterno, p.apellido_materno,
        u.ultima AS ultima_asistencia, u.en_rango AS asistencias_en_rango,
        CASE WHEN u.en_rango = 0 THEN 1 ELSE 0 END AS sin_asistir,
        CASE WHEN u.ultima >= ${pHace13} AND u.ultima < ${pHace6} THEN 1 ELSE 0 END AS en_riesgo,
        CASE WHEN u.ultima < ${pHace13} THEN 1 ELSE 0 END AS critico,
        CASE WHEN u.total = 0 THEN 1 ELSE 0 END AS nunca_asistio
      FROM clientes c
      INNER JOIN persona p ON p.id = c.id_cli
      OUTER APPLY (
        SELECT
          COUNT(CASE WHEN ${enRango.join(' AND ')} THEN 1 END) AS en_rango,
          MAX(CASE WHEN a.fecha_registro < ${pFinReferencia} THEN a.fecha_registro END) AS ultima,
          COUNT(*) AS total
        FROM persona_eventos_asistencia a
        WHERE a.id_persona = c.id_cli AND a.flag = 1
      ) u
    `, params);
    return filas
      .map(f => ({
        id_persona: f.id_persona,
        label_nombres_apellidos_persona: `${f.nombres ?? ''} ${f.apellido_paterno ?? ''} ${f.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim(),
        ultima_asistencia: f.ultima_asistencia,
        asistencias_en_rango: Number(f.asistencias_en_rango ?? 0),
        sin_asistir: !!f.sin_asistir,
        en_riesgo: !!f.en_riesgo,
        critico: !!f.critico,
        nunca_asistio: !!f.nunca_asistio,
      }))
      .sort((x, y) => x.label_nombres_apellidos_persona.localeCompare(y.label_nombres_apellidos_persona));
  }

  /** Búsqueda paginada, la más reciente primero; fecha_inicio / fecha_fin (yyyy-mm-dd) acotan la fecha de registro */
  async findSearch(q: string,
    buscarDto: BuscarAsistenciasDto
  ){
    const { offset, show, fecha_inicio, fecha_fin } = buscarDto;

    if (!q || q.trim().length===0) {
      // Sin texto: solo el rango de fechas (días de Perú, ver rango-dia-local)
      const consulta = this.personaEventosAsistenciaRepository
        .createQueryBuilder('a')
        .where('a.flag = 1')
        .orderBy('a.fecha_registro', 'DESC')
        .skip(offset)
        .take(show);
      if (fecha_inicio) consulta.andWhere('a.fecha_registro >= :desde', { desde: inicioDiaLocal(fecha_inicio) });
      if (fecha_fin) consulta.andWhere('a.fecha_registro < :hasta', { hasta: finDiaLocal(fecha_fin) });
      const [items, total] = await consulta.getManyAndCount();
      return { items: await this.conAvatares(items), total }
    }
    const { items, total } = await this.fullTextSearchService.search(
      PersonaEventosAsistencia,
      [
        'label_nombres_apellidos_persona',
        'label_subtipo',
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
      items: await this.conAvatares(items),
      total
    }
  }

  /**
   * Agrega la foto de la persona (avatar_persona) y la del colaborador del usuario que la registró
   * (avatar_usercreated, por users.id_empl); null si no tiene
   */
  private async conAvatares<T extends { id_persona?: number | null, id_usercreated?: number | null }>(asistencias: T[]) {
    const idsUsuarios = [...new Set(asistencias.map((a) => a.id_usercreated).filter((id): id is number => !!id))];
    const usuarios: { id: number, id_empl: number | null }[] = idsUsuarios.length
      ? await this.personaRepository.query(
        `SELECT id, id_empl FROM users WHERE id IN (${idsUsuarios.map((_, i) => `@${i}`).join(', ')})`, idsUsuarios)
      : [];
    const emplPorUsuario = new Map(usuarios.map((u) => [u.id, u.id_empl]));
    const avatares = await avataresPorPersona(this.personaRepository, [
      ...asistencias.map((a) => a.id_persona),
      ...usuarios.map((u) => u.id_empl),
    ]);
    return asistencias.map((a) => {
      const idEmpl = a.id_usercreated ? emplPorUsuario.get(a.id_usercreated) : null;
      return {
        ...a,
        avatar_persona: (a.id_persona && avatares.get(a.id_persona)) || null,
        avatar_usercreated: (idEmpl && avatares.get(idEmpl)) || null,
      };
    });
  }

  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
