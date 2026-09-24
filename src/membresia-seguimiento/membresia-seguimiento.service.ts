import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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
    // this.obtenerSeguimientoCarcel();
  }

  // Normaliza una fecha (Date o string) a su día en UTC (ms), sin horas.
  private aDiaUTC(fecha: Date | string): number {
    const f = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate());
  }

  // Deja membresia_seguimiento con UNA fila activa por cada venta activa que tenga
  // detalleventa_membresia activo (flag = 1):
  // - id_cli, id_venta y labels (persona/venta) desde el detalle.
  // - fecha_vencimiento = detalle.fecha_fin + SUM(dias_habiles) de sus extensiones activas
  //   (dias_habiles son días corridos, de lunes a domingo).
  // - id_extension_actual = la última extensión cuyo rango [fecha_inicio, fecha_fin] contiene hoy.
  // Reutiliza la fila existente de la venta (aunque esté inactiva), desactiva duplicados y
  // desactiva los seguimientos de ventas sin membresía activa o anuladas.
  // Se cargan las tablas completas (sin In(...)) para no superar el límite de 2100 parámetros de SQL Server.
  private async obtenerSeguimientoCarcel() {
    const ventas = await this.ventaRepository.find({ where: { flag: true } });
    const ventaPorId = new Map(ventas.map(v => [v.id!, v]));

    // Una sola membresía por venta: se queda con el último detalle (mayor id).
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

    const personas = await this.personaRepository.find();
    const personaPorId = new Map(personas.map(p => [p.id, p]));

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

    const hoyUTC = this.aDiaUTC(new Date());
    const seguimientos: MembresiaSeguimiento[] = [];

    for (const [id_venta, detalle] of detallePorVenta) {
      const extensionesVenta = extensionesPorVenta.get(id_venta) ?? [];
      const diasExtension = extensionesVenta.reduce((total, e) => total + (e.dias_habiles ?? 0), 0);
      const fecha_vencimiento = new Date(this.aDiaUTC(detalle.fecha_fin!) + diasExtension * MS_POR_DIA);

      // Ordenadas por id ASC: la última que cumpla es la extensión actual.
      const extensionActual = extensionesVenta
        .filter(e => e.fecha_inicio && e.fecha_fin
          && this.aDiaUTC(e.fecha_inicio) <= hoyUTC && hoyUTC <= this.aDiaUTC(e.fecha_fin))
        .pop();

      const id_cli = detalle.id_cli ?? ventaPorId.get(id_venta)?.id_cli;
      const persona = id_cli !== undefined ? personaPorId.get(id_cli) : undefined;

      seguimientos.push(this.membresiaSeguimientoRepository.create({
        id: existentePorVenta.get(id_venta)?.id,
        id_venta,
        id_cli,
        label_nombres_apellidos_cli: persona
          ? `${persona.nombres ?? ''} ${persona.apellido_paterno ?? ''} ${persona.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim()
          : undefined,
        telefono_cli: persona?.telefono,
        email_cli: persona?.email_personal,
        id_distrito_cli: persona?.id_distrito,
        label_distrito_cli: persona?.label_distrito as unknown as string,
        label_venta: ventaPorId.get(id_venta)?.n_comprobante ?? detalle.label_venta,
        id_extension_actual: (extensionActual?.id ?? null) as unknown as number,
        label_extension_actual: (extensionActual?.label_tipo_extension ?? null) as unknown as string,
        fecha_vencimiento,
        sesiones_pendientes: this.calcularSesionesPendientes(fecha_vencimiento),
        flag: true,
      }));
    }

    await this.membresiaSeguimientoRepository.save(seguimientos, { chunk: 100 });
    for (let i = 0; i < idsDesactivar.length; i += 1000) {
      await this.membresiaSeguimientoRepository.update({ id: In(idsDesactivar.slice(i, i + 1000)) }, { flag: false });
    }
    this.logger.log(`obtenerSeguimientoCarcel: ${seguimientos.length} seguimientos activos, ${idsDesactivar.length} desactivados`);
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

  // La más reciente (mayor id) entre las membresías vigentes (flag=true) de un cliente.
  async findUltimaActivaByIdCli(id_cli: number) {
    return await this.membresiaSeguimientoRepository.findOne({
      where: { id_cli, flag: true },
      order: { id: 'DESC' }
    });
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
