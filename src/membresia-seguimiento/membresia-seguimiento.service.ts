import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateMembresiaSeguimientoDto } from './dto/create-membresia-seguimiento.dto';
import { UpdateMembresiaSeguimientoDto } from './dto/update-membresia-seguimiento.dto';
import { MembresiaSeguimiento } from './entities/membresia-seguimiento.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { MembresiaExtension } from 'src/membresia_extension/entities/membresia_extension.entity';
import { DetalleventaMembresia } from 'src/detalleventa_membresias/entities/detalleventa_membresia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

@Injectable()
export class MembresiaSeguimientoService {
  private readonly logger = new Logger('MembresiaSeguimientoService')
  /** TERMINOLOGIA: tipo de extensión "Congelamiento" (grupo extension) y estado de cita "Atendido" (grupo cita) */
  private static readonly ID_EXTENSION_CONGELAMIENTO = 6089;
  private static readonly ID_EXTENSION_REGALO = 6090;
  private static readonly ID_CITA_ATENDIDA = 6123;

  constructor(
    @InjectRepository(MembresiaSeguimiento)
    private readonly membresiaSeguimientoRepository: Repository<MembresiaSeguimiento>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(MembresiaExtension)
    private readonly membresiaExtensionRepository: Repository<MembresiaExtension>,
    @InjectRepository(DetalleventaMembresia)
    private readonly detalleventaMembresiaRepository: Repository<DetalleventaMembresia>,
    private readonly fullTextSearchService: FullTextSearchService
  ) {
    // Backfill puntual: reconstruye TODA la data de MembresiaSeguimiento a partir de
    // detalleventa_membresia y membresia_extension. Descomentar únicamente cuando se necesite ejecutar.
    // this.obtenerSeguimientoCarcel()
    //   .then(() => this.logger.log('obtenerSeguimientoCarcel: membresia_seguimiento reconstruido'))
    //   .catch(error => this.logger.error('obtenerSeguimientoCarcel falló', error));
  }

  // Los seguimientos sin asesor (columnas nuevas) lo toman de su venta
  async onModuleInit() {
    try {
      await this.membresiaSeguimientoRepository.query(`
        UPDATE s SET s.id_empl = v.id_empl, s.label_nombres_apellidos_empl = v.label_nombres_apellidos_empl
        FROM membresia_seguimiento s
        INNER JOIN venta v ON v.id = s.id_venta
        WHERE s.id_empl IS NULL AND v.id_empl IS NOT NULL
      `);
    } catch (error) {
      this.logger.error('No se pudo completar el asesor de membresia_seguimiento', error);
    }
  }

  // Normaliza una fecha (Date o string) a su día en UTC (ms), sin horas.
  private aDiaUTC(fecha: Date | string): number {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
  }

  private nombreCompleto(persona?: Persona): string | undefined {
    if (!persona) return undefined;
    return `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim();
  }

  // Deja membresia_seguimiento con UNA fila activa por cada venta activa que tenga
  // detalleventa_membresia activo (flag = 1) con fecha_fin.
  // Cada fila se arma con armarSeguimiento (prioridad de labels, fecha_vencimiento y extensión actual).
  // Reutiliza la fila existente de la venta (aunque esté inactiva), desactiva duplicados y
  // desactiva los seguimientos de ventas sin membresía activa o anuladas.
  // Se cargan las tablas completas (sin In(...)) para no superar el límite de 2100 parámetros de SQL Server.
  private async obtenerSeguimientoCarcel() {
    // 1) Venta: fuente principal de cliente, asesor y comprobante
    const ventas = await this.ventaRepository.find({ where: { flag: true } });
    const ventaPorId = new Map(ventas.map(v => [v.id!, v]));
    console.log(`Carga finalizada correcta de venta (${ventas.length})`);

    // 2) Detalleventa_membresia: una sola membresía por venta, la última (mayor id)
    const detalles = await this.detalleventaMembresiaRepository.find({
      where: { flag: true },
      order: { id: 'ASC' }
    });
    const detallePorVenta = new Map<number, DetalleventaMembresia>();
    for (const detalle of detalles) {
      if (detalle.id_venta !== undefined && detalle.fecha_fin && ventaPorId.has(detalle.id_venta)) {
        detallePorVenta.set(detalle.id_venta, detalle);
      }
    }
    console.log(`Carga finalizada correcta de detalleventa_membresia (${detallePorVenta.size} ventas con membresia)`);

    // 3) Lo demás: extensiones y personas
    const extensiones = await this.membresiaExtensionRepository.find({
      where: { flag: true },
      order: { id: 'ASC' }
    });
    const extensionesPorVenta = new Map<number, MembresiaExtension[]>();
    for (const extension of extensiones) {
      const lista = extensionesPorVenta.get(extension.id_venta!) ?? [];
      lista.push(extension);
      extensionesPorVenta.set(extension.id_venta!, lista);
    }
    console.log(`Carga finalizada correcta de membresia_extension (${extensiones.length})`);

    const personas = await this.personaRepository.find({
      select: ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'telefono', 'email_personal', 'id_distrito', 'label_distrito']
    });
    const personaPorId = new Map(personas.map(p => [p.id, p]));
    console.log(`Carga finalizada correcta de personas (${personas.length})`);

    // Todas las filas (activas e inactivas). Por venta se reutiliza una sola: la activa de
    // menor id o, si no hay activa, la inactiva de menor id. El resto se desactiva.
    const existentes = await this.membresiaSeguimientoRepository.find({
      select: { id: true, id_venta: true, flag: true },
      order: { id: 'ASC' }
    });
    const existentePorVenta = new Map<number, MembresiaSeguimiento>();
    for (const existente of existentes) {
      const actual = existentePorVenta.get(existente.id_venta!);
      if (!actual || (!actual.flag && existente.flag)) existentePorVenta.set(existente.id_venta!, existente);
    }
    const idsReutilizados = new Set([...detallePorVenta.keys()]
      .map(id_venta => existentePorVenta.get(id_venta)?.id)
      .filter((id): id is number => id !== undefined));
    const idsDesactivar = existentes
      .filter(e => e.flag && !idsReutilizados.has(e.id!))
      .map(e => e.id!);

    const citasPorCliente = await this.citasAtendidasPorCliente();
    console.log(`Carga finalizada correcta de citas de nutricion atendidas (${citasPorCliente.size} clientes)`);

    const hoyUTC = this.aDiaUTC(new Date());
    const seguimientos: MembresiaSeguimiento[] = [];

    for (const [id_venta, detalle] of detallePorVenta) {
      const venta = ventaPorId.get(id_venta)!;
      const id_cli = venta.id_cli ?? detalle.id_cli;
      const id_empl = venta.id_empl ?? detalle.id_empl;
      seguimientos.push(this.armarSeguimiento({
        venta,
        detalle,
        extensionesVenta: extensionesPorVenta.get(id_venta) ?? [],
        cliente: id_cli != null ? personaPorId.get(id_cli) : undefined,
        asesor: id_empl != null ? personaPorId.get(id_empl) : undefined,
        idExistente: existentePorVenta.get(id_venta)?.id,
        citasAtendidas: id_cli != null ? citasPorCliente.get(id_cli) ?? [] : [],
        hoyUTC,
      }));
    }

    await this.membresiaSeguimientoRepository.save(seguimientos, { chunk: 100 });
    console.log(`Actualizacion finalizada correcta de membresia_seguimiento (${seguimientos.length} seguimientos activos)`);
    for (let i = 0; i < idsDesactivar.length; i += 1000) {
      await this.membresiaSeguimientoRepository.update({ id: In(idsDesactivar.slice(i, i + 1000)) }, { flag: false });
    }
    console.log(`Desactivacion finalizada correcta de membresia_seguimiento (${idsDesactivar.length} desactivados)`);
  }

  /**
   * Fila de membresia_seguimiento de una venta (sin guardar). Misma regla para el proceso masivo y el de una venta:
   * - Prioridad para id_* y label_*: 1) venta, 2) detalleventa_membresia, 3) persona (cliente / asesor).
   * - fecha_vencimiento = detalle.fecha_fin + SUM(dias_habiles) de sus extensiones activas (días corridos).
   * - id_extension_actual = la última extensión (por id) cuyo rango [fecha_inicio, fecha_fin] contiene hoy.
   * - Disponibles (solo si está vigente: vence hoy o después; si no, 0. Nunca negativos):
   *   dias_congelamiento_disponibles = detalle.dias_congelamiento_regalo - SUM(dias_habiles) de sus extensiones "Congelamiento";
   *   sesiones_nutricion_disponibles = detalle.citas_nutricion_regalo - citas "Atendido" del cliente entre
   *   detalle.fecha_inicio y fecha_vencimiento.
   */
  private armarSeguimiento({ venta, detalle, extensionesVenta, cliente, asesor, idExistente, citasAtendidas, hoyUTC }: {
    venta: Venta;
    detalle: DetalleventaMembresia;
    /** Extensiones activas de la venta, ordenadas por id ASC */
    extensionesVenta: MembresiaExtension[];
    cliente?: Persona;
    asesor?: Persona;
    /** Fila existente a reutilizar (si no hay, se crea una nueva) */
    idExistente?: number;
    /** Fechas (día UTC en ms) de las citas de nutrición "Atendido" del cliente */
    citasAtendidas: number[];
    hoyUTC: number;
  }): MembresiaSeguimiento {
    const diasExtension = extensionesVenta.reduce((total, e) => total + (e.dias_habiles ?? 0), 0);
    const fecha_vencimiento = new Date(this.aDiaUTC(detalle.fecha_fin!) + diasExtension * MS_POR_DIA);
    const vencimientoUTC = fecha_vencimiento.getTime();
    const vigente = vencimientoUTC >= hoyUTC;

    const diasCongelados = extensionesVenta
      .filter(e => e.id_tipo_extension === MembresiaSeguimientoService.ID_EXTENSION_CONGELAMIENTO)
      .reduce((total, e) => total + (e.dias_habiles ?? 0), 0);
    const inicioUTC = detalle.fecha_inicio ? this.aDiaUTC(detalle.fecha_inicio) : -Infinity;
    const citasUsadas = citasAtendidas.filter(dia => dia >= inicioUTC && dia <= vencimientoUTC).length;

    // Ordenadas por id ASC: la última que cumpla es la extensión actual.
    const extensionActual = extensionesVenta
      .filter(e => e.fecha_inicio && e.fecha_fin
        && this.aDiaUTC(e.fecha_inicio) <= hoyUTC && hoyUTC <= this.aDiaUTC(e.fecha_fin))
      .pop();

    return this.membresiaSeguimientoRepository.create({
      id: idExistente,
      id_venta: venta.id,
      id_cli: venta.id_cli ?? detalle.id_cli,
      label_nombres_apellidos_cli: venta.label_nombres_apellidos_cli || detalle.label_nombres_apellidos_cli || this.nombreCompleto(cliente),
      telefono_cli: cliente?.telefono,
      email_cli: cliente?.email_personal,
      id_distrito_cli: cliente?.id_distrito,
      label_distrito_cli: cliente?.label_distrito as unknown as string,
      label_venta: venta.n_comprobante || detalle.label_venta || detalle.n_comprobante,
      id_empl: venta.id_empl ?? detalle.id_empl,
      label_nombres_apellidos_empl: venta.label_nombres_apellidos_empl || detalle.label_nombres_apellidos_empl || this.nombreCompleto(asesor),
      id_extension_actual: (extensionActual?.id ?? null) as unknown as number,
      label_extension_actual: (extensionActual?.label_tipo_extension ?? null) as unknown as string,
      fecha_vencimiento,
      sesiones_pendientes: this.calcularSesionesPendientes(fecha_vencimiento),
      dias_congelamiento_disponibles: vigente ? Math.max(0, (detalle.dias_congelamiento_regalo ?? 0) - diasCongelados) : 0,
      sesiones_nutricion_disponibles: vigente ? Math.max(0, (detalle.citas_nutricion_regalo ?? 0) - citasUsadas) : 0,
      flag: true,
    });
  }

  /** Citas de nutrición "Atendido" (activas) por cliente: fechas como día UTC en ms. Con id_cli, solo las de ese cliente */
  private async citasAtendidasPorCliente(id_cli?: number): Promise<Map<number, number[]>> {
    const params: number[] = [MembresiaSeguimientoService.ID_CITA_ATENDIDA];
    if (id_cli != null) params.push(id_cli);
    const filas: { id_cli: number, fecha: string }[] = await this.membresiaSeguimientoRepository.query(`
      SELECT id_cli, CONVERT(varchar(10), fecha, 23) AS fecha
      FROM agenda_nutricionista
      WHERE flag = 1 AND id_estado = @0${id_cli != null ? ' AND id_cli = @1' : ''}
    `, params);
    const porCliente = new Map<number, number[]>();
    for (const { id_cli: cliente, fecha } of filas) {
      const lista = porCliente.get(cliente) ?? [];
      lista.push(this.aDiaUTC(`${fecha}T00:00:00Z`));
      porCliente.set(cliente, lista);
    }
    return porCliente;
  }

  /**
   * Recalcula y guarda el seguimiento de UNA membresía vendida (detalleventa_membresia.id), con la misma regla que
   * obtenerSeguimientoCarcel: reutiliza la fila de su venta (la activa de menor id o, si no hay, la inactiva de
   * menor id) y desactiva las demás filas activas de esa venta. Devuelve el seguimiento guardado.
   */
  async actualizarSeguimientoPorMembresia(id_membresia: number): Promise<MembresiaSeguimiento> {
    const detalle = await this.detalleventaMembresiaRepository.findOne({ where: { id: id_membresia, flag: true } });
    if (!detalle) throw new NotFoundException(`No existe la membresía vendida ${id_membresia}`);
    if (!detalle.fecha_fin) throw new BadRequestException(`La membresía vendida ${id_membresia} no tiene fecha fin`);

    const venta = await this.ventaRepository.findOne({ where: { id: detalle.id_venta, flag: true } });
    if (!venta) throw new NotFoundException(`La venta ${detalle.id_venta} de la membresía ${id_membresia} no existe o está anulada`);

    const id_cli = venta.id_cli ?? detalle.id_cli;
    const id_empl = venta.id_empl ?? detalle.id_empl;
    const selectPersona: (keyof Persona)[] = ['id', 'nombres', 'apellido_paterno', 'apellido_materno', 'telefono', 'email_personal', 'id_distrito', 'label_distrito'];
    const [extensionesVenta, cliente, asesor, existentes, citasPorCliente] = await Promise.all([
      this.membresiaExtensionRepository.find({ where: { id_venta: venta.id, flag: true }, order: { id: 'ASC' } }),
      id_cli != null ? this.personaRepository.findOne({ select: selectPersona, where: { id: id_cli } }) : null,
      id_empl != null ? this.personaRepository.findOne({ select: selectPersona, where: { id: id_empl } }) : null,
      this.membresiaSeguimientoRepository.find({ select: { id: true, flag: true }, where: { id_venta: venta.id }, order: { id: 'ASC' } }),
      id_cli != null ? this.citasAtendidasPorCliente(id_cli) : new Map<number, number[]>(),
    ]);

    const reutilizada = existentes.find(e => e.flag) ?? existentes[0];
    const seguimiento = await this.membresiaSeguimientoRepository.save(this.armarSeguimiento({
      venta,
      detalle,
      extensionesVenta,
      cliente: cliente ?? undefined,
      asesor: asesor ?? undefined,
      idExistente: reutilizada?.id,
      citasAtendidas: id_cli != null ? citasPorCliente.get(id_cli) ?? [] : [],
      hoyUTC: this.aDiaUTC(new Date()),
    }));

    const idsDesactivar = existentes.filter(e => e.flag && e.id !== seguimiento.id).map(e => e.id!);
    if (idsDesactivar.length) await this.membresiaSeguimientoRepository.update({ id: In(idsDesactivar) }, { flag: false });
    return seguimiento;
  }

  /**
   * Recalcula el seguimiento de una venta con su membresía vendida activa (la de mayor id, como el proceso masivo).
   * Devuelve null si la venta no tiene membresía con fecha fin (no hay seguimiento que actualizar).
   */
  async actualizarSeguimientoPorVenta(id_venta: number): Promise<MembresiaSeguimiento | null> {
    const detalle = await this.detalleventaMembresiaRepository.findOne({
      select: { id: true, fecha_fin: true },
      where: { id_venta, flag: true },
      order: { id: 'DESC' },
    });
    if (!detalle?.fecha_fin) return null;
    return this.actualizarSeguimientoPorMembresia(detalle.id!);
  }

  private async getLabels(dto: {
    id_cli?: number;
    id_venta?: number;
    id_extension_actual?: number;
  }) {
    const labels: Partial<MembresiaSeguimiento> = {};

    if (dto.id_cli !== undefined) {
      const persona = await this.personaRepository.findOne({ where: { id: dto.id_cli } });
      labels.label_nombres_apellidos_cli = persona
        ? `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim()
        : undefined;
      labels.telefono_cli = persona?.telefono;
      labels.email_cli = persona?.email_personal;
      labels.id_distrito_cli = persona?.id_distrito;
      labels.label_distrito_cli = persona?.label_distrito as unknown as string;
    }

    if (dto.id_venta !== undefined) {
      const venta = await this.ventaRepository.findOne({ where: { id: dto.id_venta } });
      labels.label_venta = venta?.n_comprobante;
      // Asesor / vendedor de la venta
      labels.id_empl = venta?.id_empl;
      labels.label_nombres_apellidos_empl = venta?.label_nombres_apellidos_empl;
    }

    if (dto.id_extension_actual !== undefined) {
      const extension = await this.membresiaExtensionRepository.findOne({ where: { id: dto.id_extension_actual } });
      labels.label_extension_actual = extension?.label_tipo_extension;
    }

    return labels;
  }

  private calcularSesionesPendientes(fecha_vencimiento?: Date | string): number {
    if (!fecha_vencimiento) return 0;
    const hoy = new Date();
    const hoyUTC = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate());
    const vencimiento = typeof fecha_vencimiento === 'string' ? new Date(fecha_vencimiento) : fecha_vencimiento;
    const vencimientoUTC = Date.UTC(vencimiento.getUTCFullYear(), vencimiento.getUTCMonth(), vencimiento.getUTCDate());
    return Math.max(0, Math.round((vencimientoUTC - hoyUTC) / MS_POR_DIA) + 1);
  }

  async create(createMembresiaSeguimientoDto: CreateMembresiaSeguimientoDto) {
    try {
      const labels = await this.getLabels(createMembresiaSeguimientoDto);
      const membresiaSeguimiento = this.membresiaSeguimientoRepository.create({
        ...createMembresiaSeguimientoDto,
        ...labels,
        sesiones_pendientes: this.calcularSesionesPendientes(createMembresiaSeguimientoDto.fecha_vencimiento)
      })
      await this.membresiaSeguimientoRepository.save(membresiaSeguimiento)
      return {
        ok: true,
        id: membresiaSeguimiento.id,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.membresiaSeguimientoRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
      },
      order: {
        id: 'ASC'
      }
    });
    return {
      lista,
      total
    }
  }

  async findOne(id: number) {
    return await this.membresiaSeguimientoRepository.findOne({ where: { id, flag: true } });
  }

  // Todas las membresías vigentes (flag=true) de un cliente, la que vence más tarde primero.
  async findAllByIdCli(id_cli: number) {
    return await this.membresiaSeguimientoRepository.find({
      where: { id_cli, flag: true },
      order: { fecha_vencimiento: 'DESC' }
    });
  }

  // La más reciente (mayor id) entre las membresías vigentes (flag=true) de un cliente.
  async findUltimaActivaByIdCli(id_cli: number) {
    return await this.membresiaSeguimientoRepository.findOne({
      where: { id_cli, flag: true },
      order: { id: 'DESC' }
    });
  }

  /**
   * Membresía actual del cliente para registrar su asistencia: la que vence más tarde, con su
   * programa y plan (detalle de la venta) y si la venta ya está pagada. null si no tiene membresías.
   */
  /**
   * Membresías (seguimientos activos) del cliente con el detalle de su venta: programa, plan, horario, fecha de inicio
   * y vencimiento. Congelamiento y citas de nutrición: regalados por el plan y disponibles guardados en el seguimiento
   * (dias_congelamiento_disponibles / sesiones_nutricion_disponibles, ver armarSeguimiento). dias_congelados y
   * dias_regalo: días de las extensiones "Congelamiento" y "Regalo" de la venta. citas_atendidas: citas "Atendido"
   * del cliente entre el inicio y el vencimiento de la membresía.
   * dias_regalo: días de las extensiones "Regalo" de esa venta.
   */
  async findDetalleByIdCli(id_cli: number) {
    return this.membresiaSeguimientoRepository.query(`
      SELECT
        s.id, s.id_cli, s.id_venta, s.label_venta, s.label_extension_actual, s.sesiones_pendientes,
        CONVERT(varchar(10), s.fecha_vencimiento, 23) AS fecha_vencimiento,
        d.label_programa, d.label_plan, d.label_horario,
        CONVERT(varchar(10), d.fecha_inicio, 23) AS fecha_inicio,
        ISNULL(d.dias_congelamiento_regalo, 0) AS congelamiento_regalados,
        s.dias_congelamiento_disponibles AS congelamiento_disponibles,
        ISNULL(cg.dias, 0) AS dias_congelados,
        ISNULL(d.citas_nutricion_regalo, 0) AS citas_regaladas,
        s.sesiones_nutricion_disponibles AS citas_disponibles,
        ISNULL(ct.citas, 0) AS citas_atendidas,
        ISNULL(rg.dias, 0) AS dias_regalo
      FROM membresia_seguimiento s
      OUTER APPLY (
        SELECT TOP 1 dm.label_programa, dm.label_plan, dm.label_horario, dm.fecha_inicio,
          dm.dias_congelamiento_regalo, dm.citas_nutricion_regalo
        FROM detalleventa_membresia dm
        WHERE dm.id_venta = s.id_venta AND dm.flag = 1
        ORDER BY dm.id DESC
      ) d
      OUTER APPLY (
        SELECT SUM(e.dias_habiles) AS dias
        FROM membresia_extension e
        WHERE e.id_venta = s.id_venta AND e.flag = 1 AND e.id_tipo_extension = @1
      ) cg
      OUTER APPLY (
        SELECT SUM(e.dias_habiles) AS dias
        FROM membresia_extension e
        WHERE e.id_venta = s.id_venta AND e.flag = 1 AND e.id_tipo_extension = @2
      ) rg
      OUTER APPLY (
        SELECT COUNT(*) AS citas
        FROM agenda_nutricionista c
        WHERE c.id_cli = s.id_cli AND c.flag = 1 AND c.id_estado = @3
          AND c.fecha >= ISNULL(d.fecha_inicio, '19000101') AND c.fecha <= s.fecha_vencimiento
      ) ct
      WHERE s.id_cli = @0 AND s.flag = 1
    `, [id_cli, MembresiaSeguimientoService.ID_EXTENSION_CONGELAMIENTO, MembresiaSeguimientoService.ID_EXTENSION_REGALO,
      MembresiaSeguimientoService.ID_CITA_ATENDIDA]);
  }


  async findResumenActualByIdCli(id_cli: number) {
    const seguimiento = await this.membresiaSeguimientoRepository.findOne({
      where: { id_cli, flag: true },
      order: { fecha_vencimiento: 'DESC' },
    });
    if (!seguimiento) return null;

    const [venta, detalle] = await Promise.all([
      this.ventaRepository.findOne({
        where: { id: seguimiento.id_venta },
        select: { id: true, montoTotal_membresia: true, montoTotal_productos: true, montoPagos: true },
      }),
      this.detalleventaMembresiaRepository.findOne({
        where: { id_venta: seguimiento.id_venta, flag: true },
        select: { id: true, label_programa: true, label_plan: true, label_horario: true, fecha_inicio: true },
      }),
    ]);
    // Mismo total que la tabla de ventas: membresías + productos (ya con descuento)
    const montoTotal = Number(venta?.montoTotal_membresia ?? 0) + Number(venta?.montoTotal_productos ?? 0);
    const montoPagado = Number(venta?.montoPagos ?? 0);

    return {
      id_venta: seguimiento.id_venta,
      label_venta: seguimiento.label_venta,
      label_programa: detalle?.label_programa ?? null,
      label_plan: detalle?.label_plan ?? null,
      label_horario: detalle?.label_horario ?? null,
      // Inicio de la membresía vendida; el fin es el vencimiento del seguimiento (incluye extensiones)
      fecha_inicio: detalle?.fecha_inicio ?? null,
      fecha_vencimiento: seguimiento.fecha_vencimiento,
      montoTotal,
      montoPagado,
      // Margen de medio céntimo por redondeo de decimales
      pagado: montoPagado >= montoTotal - 0.005,
    };
  }

  async update(id: number, updateMembresiaSeguimientoDto: UpdateMembresiaSeguimientoDto) {
    const labels = await this.getLabels(updateMembresiaSeguimientoDto);
    const membresiaSeguimiento = await this.membresiaSeguimientoRepository.preload({
      id,
      ...updateMembresiaSeguimientoDto,
      ...labels,
      ...(updateMembresiaSeguimientoDto.fecha_vencimiento !== undefined
        ? { sesiones_pendientes: this.calcularSesionesPendientes(updateMembresiaSeguimientoDto.fecha_vencimiento) }
        : {})
    });
    if (!membresiaSeguimiento) throw new BadRequestException(`MembresiaSeguimiento with id ${id} not found`);
    try {
      await this.membresiaSeguimientoRepository.save(membresiaSeguimiento);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.membresiaSeguimientoRepository.update(id, { flag: false });
  }

  // Crea o actualiza el seguimiento activo de una venta según su membresía.
  async sincronizarPorVenta(id_venta: number, id_cli: number | undefined, fecha_vencimiento: Date | string) {
    const existente = await this.membresiaSeguimientoRepository.findOne({ where: { id_venta, flag: true } });
    const labels = await this.getLabels({ id_cli, id_venta });
    await this.membresiaSeguimientoRepository.save(this.membresiaSeguimientoRepository.create({
      ...existente,
      id_venta,
      id_cli: id_cli ?? existente?.id_cli,
      fecha_vencimiento: fecha_vencimiento as Date,
      sesiones_pendientes: this.calcularSesionesPendientes(fecha_vencimiento),
      ...labels,
    }));
  }

  // Actualiza cliente y label_venta del seguimiento cuando cambia la venta.
  async actualizarDatosVenta(id_venta: number, id_cli?: number) {
    const labels = await this.getLabels({ id_cli, id_venta });
    await this.membresiaSeguimientoRepository.update(
      { id_venta, flag: true },
      { ...(id_cli !== undefined ? { id_cli } : {}), ...labels }
    );
  }

  desactivarPorVenta(id_venta: number) {
    return this.membresiaSeguimientoRepository.update({ id_venta }, { flag: false });
  }

  async findSearch(q: string, paginationDto: PaginationDto) {
    const { offset, show } = paginationDto;

    if (q.trim().length === 0) {
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      }
    }
    const { items, total } = await this.fullTextSearchService.search(
      MembresiaSeguimiento,
      [
        'label_nombres_apellidos_cli',
        'label_nombres_apellidos_empl',
        'telefono_cli',
        'email_cli',
        'label_distrito_cli',
        'label_venta',
        'label_extension_actual'
      ],
      q,
      {
        take: show,
        skip: offset
      }
    );
    return {
      items,
      total
    }
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
