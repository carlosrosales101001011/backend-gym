import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetalleventaProductoDto } from './dto/create-detalleventa_producto.dto';
import { UpdateDetalleventaProductoDto } from './dto/update-detalleventa_producto.dto';
import { DetalleventaProducto } from './entities/detalleventa_producto.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { recalcularTotalesVenta } from 'src/common/helpers/recalcular-totales-venta';

@Injectable()
export class DetalleventaProductosService {
  private readonly logger = new Logger('DetalleventaProductosService')
      constructor(
        @InjectRepository(DetalleventaProducto)
        private readonly detalleventaProductoRepository: Repository<DetalleventaProducto>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_venta?: number;
    id_producto?: number;
  }) {
    const labels: Partial<DetalleventaProducto> = {};

    if (dto.id_venta !== undefined) {
      const venta = await this.ventaRepository.findOne({ where: { id: dto.id_venta } });
      labels.label_venta = venta?.n_comprobante;
      labels.id_cli = venta?.id_cli;
      labels.label_nombres_apellidos_cli = venta?.label_nombres_apellidos_cli;
      labels.id_empl = venta?.id_empl;
      labels.label_nombres_apellidos_empl = venta?.label_nombres_apellidos_empl;
      labels.id_origen = venta?.id_origen;
      labels.label_origen = venta?.label_origen;
      labels.id_sucursal = venta?.id_sucursal;
      labels.label_sucursal = venta?.label_sucursal;
      labels.id_tipo_comprobante = venta?.id_tipo_comprobante;
      labels.label_tipo_comprobante = venta?.label_tipo_comprobante;
      labels.n_comprobante = venta?.n_comprobante;
    }

    if (dto.id_producto !== undefined) {
      const producto = await this.productoRepository.findOne({ where: { id: dto.id_producto } });
      labels.label_producto = producto?.nombre;
    }

    return labels;
  }

  private async recalcularTotales(id_venta?: number) {
    await recalcularTotalesVenta(this.detalleventaProductoRepository.manager, id_venta);
  }

  async create(createDetalleventaProductoDto: CreateDetalleventaProductoDto) {
    try {
      const labels = await this.getLabels(createDetalleventaProductoDto);
      const detalleventaProducto = this.detalleventaProductoRepository.create({
        ...createDetalleventaProductoDto,
        ...labels
      })
      await this.detalleventaProductoRepository.save(detalleventaProducto)
      await this.recalcularTotales(detalleventaProducto.id_venta)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createBulk(createDetalleventaProductoDto: CreateDetalleventaProductoDto[]) {
    try {
      const detallesConLabels = await Promise.all(
        createDetalleventaProductoDto.map(async (dto) => {
          const labels = await this.getLabels(dto);
          return {
            ...dto,
            ...labels
          };
        })
      );
      const detalleventaProductos = this.detalleventaProductoRepository.create(detallesConLabels);
      await this.detalleventaProductoRepository.save(detalleventaProductos);
      const idsVenta = [...new Set(detalleventaProductos.map(d => d.id_venta))];
      for (const id_venta of idsVenta) await this.recalcularTotales(id_venta);
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
    const [ lista, total ] = await this.detalleventaProductoRepository.findAndCount({
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
    return await this.detalleventaProductoRepository.findOne({
      where: { id, flag: true },
      select: {
        id: true,
        id_venta: true, label_venta: false,
        id_cli: true, label_nombres_apellidos_cli: false,
        id_empl: true, label_nombres_apellidos_empl: false,
        id_origen: true, label_origen: false,
        id_sucursal: true, label_sucursal: false,
        id_tipo_comprobante: true, label_tipo_comprobante: false,
        n_comprobante: false,
        id_producto: true, label_producto: false,
        precio_unitario_producto: true,
        cantidad: true,
        montoTotal: true,
        montoDescuento: true
      }
    });
  }

  async update(id: number, updateDetalleventaProductoDto: UpdateDetalleventaProductoDto) {
    const anterior = await this.detalleventaProductoRepository.findOne({ where: { id } });
    const labels = await this.getLabels(updateDetalleventaProductoDto);
    const detalleventaProducto = await this.detalleventaProductoRepository.preload({
      id,
      ...updateDetalleventaProductoDto,
      ...labels
    });
    if (!detalleventaProducto) throw new BadRequestException(`DetalleventaProducto with id ${id} not found`);
    try {
      await this.detalleventaProductoRepository.save(detalleventaProducto);
      await this.recalcularTotales(detalleventaProducto.id_venta);
      if (anterior?.id_venta !== undefined && anterior.id_venta !== detalleventaProducto.id_venta) {
        await this.recalcularTotales(anterior.id_venta);
      }
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const detalleventaProducto = await this.detalleventaProductoRepository.findOne({ where: { id } });
    const result = await this.detalleventaProductoRepository.update(id, {flag: false});
    await this.recalcularTotales(detalleventaProducto?.id_venta);
    return result;
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
  const {items, total} =await this.fullTextSearchService.search(
      DetalleventaProducto,
      [
        'label_venta',
        'label_nombres_apellidos_cli',
        'label_nombres_apellidos_empl',
        'label_origen',
        'label_sucursal',
        'label_tipo_comprobante',
        'n_comprobante',
        'label_producto'
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
