import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateVentaDto } from './dto/create-venta.dto';
import { UpdateVentaDto } from './dto/update-venta.dto';
import { Venta } from './entities/venta.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { DetalleventaMembresia } from 'src/detalleventa_membresias/entities/detalleventa_membresia.entity';
import { DetalleventaProducto } from 'src/detalleventa_productos/entities/detalleventa_producto.entity';
import { DetalleventaPago } from 'src/detalleventa_pagos/entities/detalleventa_pago.entity';
import { MembresiaSeguimientoService } from 'src/membresia-seguimiento/membresia-seguimiento.service';

@Injectable()
export class VentaService {
  private readonly logger = new Logger('VentaService')
  constructor(
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    @InjectRepository(EmpresaSucursal)
    private readonly empresaSucursalRepository: Repository<EmpresaSucursal>,
    @InjectRepository(DetalleventaMembresia)
    private readonly detalleventaMembresiaRepository: Repository<DetalleventaMembresia>,
    @InjectRepository(DetalleventaProducto)
    private readonly detalleventaProductoRepository: Repository<DetalleventaProducto>,
    @InjectRepository(DetalleventaPago)
    private readonly detalleventaPagoRepository: Repository<DetalleventaPago>,
    private readonly fullTextSearchService: FullTextSearchService,
    private readonly membresiaSeguimientoService: MembresiaSeguimientoService
  ){
    // Backfill puntual: recalcula los label_* y montos de TODA la data de Venta (no solo
    // el registro creado/editado). Descomentar únicamente cuando se necesite ejecutar.
    // this.obtenerLabelsDeVentaCarcel();
  }

  // Suma `columna` de los detalles activos (flag = 1) agrupados por id_venta.
  private async sumarPorVenta<T extends { id_venta?: number }>(
    repository: Repository<T>,
    columna: string
  ) {
    const filas = await repository.createQueryBuilder('d')
      .select('d.id_venta', 'id_venta')
      .addSelect(`SUM(d.${columna})`, 'total')
      .where('d.flag = 1')
      .groupBy('d.id_venta')
      .getRawMany<{ id_venta: number; total: number | string | null }>();
    return new Map(filas.map(f => [f.id_venta, Number(f.total ?? 0)]));
  }

  // Recorre TODA la tabla Venta y actualiza sus label_* a partir de los id_* que son
  // netamente Persona (id_empl, id_cli), Terminologia (id_origen, id_tipo_comprobante)
  // y EmpresaSucursal (id_sucursal). Además recalcula montoTotal_membresia,
  // montoTotal_productos, montoPagos y montoDescuento sumando sus detalleventa_* activos.
  private async obtenerLabelsDeVentaCarcel() {
    const ventas = await this.ventaRepository.find();
    if (ventas.length === 0) return;

    const idsPersona = ventas.flatMap(venta => [venta.id_empl, venta.id_cli])
      .filter((id): id is number => id !== undefined && id !== null);
    const idsTerminologia = ventas.flatMap(venta => [venta.id_origen, venta.id_tipo_comprobante])
      .filter((id): id is number => id !== undefined && id !== null);
    const idsSucursal = ventas.map(venta => venta.id_sucursal)
      .filter((id): id is number => id !== undefined && id !== null);

    const personas = idsPersona.length
      ? await this.personaRepository.findBy({ id: In([...new Set(idsPersona)]) })
      : [];
    const nombresPorId = new Map(personas.map(p => [p.id, `${p.nombres ?? ''} ${p.apellido_paterno ?? ''} ${p.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim()]));
    const documentoPorId = new Map(personas.map(p => [p.id, `${p.label_tipo_documento}: ${p.numero_documento}`]));

    const terminologias = idsTerminologia.length
      ? await this.terminologiaRepository.findBy({ id: In([...new Set(idsTerminologia)]) })
      : [];
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    const sucursales = idsSucursal.length
      ? await this.empresaSucursalRepository.findBy({ id: In([...new Set(idsSucursal)]) })
      : [];
    const sucursalPorId = new Map(sucursales.map(s => [s.id, s.nombre]));

    const membresiasPorVenta = await this.sumarPorVenta(this.detalleventaMembresiaRepository, 'montoTotal');
    const productosPorVenta = await this.sumarPorVenta(this.detalleventaProductoRepository, 'montoTotal');
    const pagosPorVenta = await this.sumarPorVenta(this.detalleventaPagoRepository, 'monto');
    const descuentoMembresiasPorVenta = await this.sumarPorVenta(this.detalleventaMembresiaRepository, 'montoDescuento');
    const descuentoProductosPorVenta = await this.sumarPorVenta(this.detalleventaProductoRepository, 'montoDescuento');

    for (const venta of ventas) {
      venta.montoTotal_membresia = membresiasPorVenta.get(venta.id!) ?? 0;
      venta.montoTotal_productos = productosPorVenta.get(venta.id!) ?? 0;
      venta.montoPagos = pagosPorVenta.get(venta.id!) ?? 0;
      venta.montoDescuento = (descuentoMembresiasPorVenta.get(venta.id!) ?? 0) + (descuentoProductosPorVenta.get(venta.id!) ?? 0);

      if (venta.id_empl !== undefined) {
        venta.label_nombres_apellidos_empl = nombresPorId.get(venta.id_empl);
        venta.label_documento_empl = documentoPorId.get(venta.id_empl);
      }
      if (venta.id_cli !== undefined) {
        venta.label_nombres_apellidos_cli = nombresPorId.get(venta.id_cli);
        venta.label_documento_cli = documentoPorId.get(venta.id_cli);
      }
      if (venta.id_origen !== undefined) venta.label_origen = valorPorId.get(venta.id_origen);
      if (venta.id_tipo_comprobante !== undefined) venta.label_tipo_comprobante = valorPorId.get(venta.id_tipo_comprobante);
      if (venta.id_sucursal !== undefined) venta.label_sucursal = sucursalPorId.get(venta.id_sucursal);
    }

    await this.ventaRepository.save(ventas);
  }

  private async getPersonaLabels(dto: {
    id_empl?: number;
    id_cli?: number;
  }) {
    const ids = [dto.id_empl, dto.id_cli]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Venta> = {};
    if (ids.length === 0) return labels;

    const personas = await this.personaRepository.findBy({ id: In(ids) });
    const nombresPorId = new Map(personas.map(p => [p.id, `${p.nombres ?? ''} ${p.apellido_paterno ?? ''} ${p.apellido_materno ?? ''}`.replace(/\s+/g, ' ').trim()]));
    const documentoPorId = new Map(personas.map(p => [p.id, `${p.label_tipo_documento}: ${p.numero_documento}`]));

    if (dto.id_empl !== undefined) {
      labels.label_nombres_apellidos_empl = nombresPorId.get(dto.id_empl);
      labels.label_documento_empl = documentoPorId.get(dto.id_empl);
    }
    if (dto.id_cli !== undefined) {
      labels.label_nombres_apellidos_cli = nombresPorId.get(dto.id_cli);
      labels.label_documento_cli = documentoPorId.get(dto.id_cli);
    }

    return labels;
  }

  private async getTerminologiaLabels(dto: {
    id_origen?: number;
    id_tipo_comprobante?: number;
  }) {
    const ids = [dto.id_origen, dto.id_tipo_comprobante]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Venta> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_origen !== undefined) labels.label_origen = valorPorId.get(dto.id_origen);
    if (dto.id_tipo_comprobante !== undefined) labels.label_tipo_comprobante = valorPorId.get(dto.id_tipo_comprobante);

    return labels;
  }

  private async getSucursalLabels(dto: {
    id_sucursal?: number;
  }) {
    const labels: Partial<Venta> = {};

    if (dto.id_sucursal !== undefined) {
      const sucursal = await this.empresaSucursalRepository.findOne({ where: { id: dto.id_sucursal } });
      labels.label_sucursal = sucursal?.nombre;
    }

    return labels;
  }
  async create(createVentaDto: CreateVentaDto) {
    try {
      const personaLabels = await this.getPersonaLabels(createVentaDto);
      const terminologiaLabels = await this.getTerminologiaLabels(createVentaDto);
      const sucursalLabels = await this.getSucursalLabels(createVentaDto);
      const venta = this.ventaRepository.create({
        ...createVentaDto,
        ...personaLabels,
        ...terminologiaLabels,
        ...sucursalLabels,
        fecha_venta: new Date()
      })
      await this.ventaRepository.save(venta)
      return {
        ok: true,
        id: venta.id,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
  async findByIdCli(id_cli:number){
    const [ lista, total ] = await this.ventaRepository.findAndCount({
      where: {
        flag: true,
        id_cli
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
  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.ventaRepository.findAndCount({
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
    return await this.ventaRepository.findOne({where: {id, flag: true}});
  }

  // Venta + membresías, productos y pagos activos, para el modal de información de la venta.
  async findDetalle(id: number) {
    const venta = await this.findOne(id);
    if (!venta) throw new BadRequestException(`Venta with id ${id} not found`);
    const [membresias, productos, pagos] = await Promise.all([
      this.detalleventaMembresiaRepository.find({ where: { id_venta: id, flag: true }, order: { id: 'ASC' } }),
      this.detalleventaProductoRepository.find({ where: { id_venta: id, flag: true }, order: { id: 'ASC' } }),
      this.detalleventaPagoRepository.find({ where: { id_venta: id, flag: true }, order: { id: 'ASC' } }),
    ]);
    return { venta, membresias, productos, pagos };
  }

  // Copia los campos derivados de la venta (VENTA.ENTITY=>[...]) a sus detalleventa_* y seguimiento.
  private async propagarVentaADetalles(venta: Venta) {
    const derivados = {
      label_venta: venta.n_comprobante,
      id_cli: venta.id_cli,
      label_nombres_apellidos_cli: venta.label_nombres_apellidos_cli,
      id_empl: venta.id_empl,
      label_nombres_apellidos_empl: venta.label_nombres_apellidos_empl,
      id_origen: venta.id_origen,
      label_origen: venta.label_origen,
      id_sucursal: venta.id_sucursal,
      label_sucursal: venta.label_sucursal,
      id_tipo_comprobante: venta.id_tipo_comprobante,
      label_tipo_comprobante: venta.label_tipo_comprobante,
      n_comprobante: venta.n_comprobante,
    };
    await Promise.all([
      this.detalleventaMembresiaRepository.update({ id_venta: venta.id }, derivados),
      this.detalleventaProductoRepository.update({ id_venta: venta.id }, derivados),
      this.detalleventaPagoRepository.update({ id_venta: venta.id }, derivados),
    ]);
    await this.membresiaSeguimientoService.actualizarDatosVenta(venta.id!, venta.id_cli);
  }

  async update(id: number, updateVentaDto: UpdateVentaDto) {
    const personaLabels = await this.getPersonaLabels(updateVentaDto);
    const terminologiaLabels = await this.getTerminologiaLabels(updateVentaDto);
    const sucursalLabels = await this.getSucursalLabels(updateVentaDto);
    const venta = await this.ventaRepository.preload({
      id,
      ...updateVentaDto,
      ...personaLabels,
      ...terminologiaLabels,
      ...sucursalLabels
    });
    if (!venta) throw new BadRequestException(`Venta with id ${id} not found`);
    try {
      await this.ventaRepository.save(venta);
      await this.propagarVentaADetalles(venta);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.ventaRepository.update(id, {flag: false});
  }

  async findSearch (  q: string,
    paginationDto: PaginationDto
  ){
    const { offset, show } = paginationDto;

    if (q.trim().length===0) {
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      }
    }
    const {items, total} = await this.fullTextSearchService.search(
      Venta,
      [
        'label_nombres_apellidos_empl',
        'label_documento_empl',
        'label_nombres_apellidos_cli',
        'label_documento_cli',
        'label_origen',
        'label_tipo_comprobante',
        'n_comprobante',
        'label_sucursal',
        'observacion'
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

  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
