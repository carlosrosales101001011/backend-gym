import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetalleventaPagoDto } from './dto/create-detalleventa_pago.dto';
import { UpdateDetalleventaPagoDto } from './dto/update-detalleventa_pago.dto';
import { DetalleventaPago } from './entities/detalleventa_pago.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { recalcularTotalesVenta } from 'src/common/helpers/recalcular-totales-venta';
import { RangoFechasDto } from 'src/venta/dto/rango-fechas.dto';

@Injectable()
export class DetalleventaPagosService {
  private readonly logger = new Logger('DetalleventaPagosService')
  constructor(
    @InjectRepository(DetalleventaPago)
    private readonly detalleventaPagoRepository: Repository<DetalleventaPago>,
    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,
  ) {}

  private async getLabels(dto: {
    id_venta?: number;
  }) {
    const labels: Partial<DetalleventaPago> = {};

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

    return labels;
  }

  private async recalcularMontoPagos(id_venta?: number) {
    await recalcularTotalesVenta(this.ventaRepository.manager, id_venta);
  }

  async create(createDetalleventaPagoDto: CreateDetalleventaPagoDto) {
    try {
      const labels = await this.getLabels(createDetalleventaPagoDto);
      const detalleventaPago = this.detalleventaPagoRepository.create({
        ...createDetalleventaPagoDto,
        ...labels
      })
      await this.detalleventaPagoRepository.save(detalleventaPago)
      await this.recalcularMontoPagos(detalleventaPago.id_venta);
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createBulk(createDetalleventaPagoDtos: CreateDetalleventaPagoDto[]) {
    try {
      const detallesConLabels = await Promise.all(
        createDetalleventaPagoDtos.map(async (dto) => {
          const labels = await this.getLabels(dto);
          return {
            ...dto,
            ...labels
          };
        })
      );
      console.log({createDetalleventaPagoDtos});
      const detalleventaPagos = this.detalleventaPagoRepository.create(detallesConLabels);
      await this.detalleventaPagoRepository.save(detalleventaPagos);

      const idsVenta = [...new Set(detalleventaPagos.map(d => d.id_venta).filter((id): id is number => id !== undefined))];
      await Promise.all(idsVenta.map(id_venta => this.recalcularMontoPagos(id_venta)));

      return {
        ok: true,
        msg: 'creados con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.detalleventaPagoRepository.findAndCount({
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

  // Pagos activos (de ventas activas) con fecha_pago entre fecha_inicio y fecha_fin (yyyy-MM-dd), sin paginar:
  // los ingresos de un periodo, ej. el de una meta. Trae el tipo de cliente y el documento desde la venta.
  async findByRangoFechas({ fecha_inicio, fecha_fin }: RangoFechasDto) {
    const fechaDesde = fecha_inicio.slice(0, 10);
    const fechaHasta = fecha_fin.slice(0, 10);
    if (fechaHasta < fechaDesde) {
      throw new BadRequestException('fecha_fin no puede ser anterior a fecha_inicio');
    }
    const lista = await this.detalleventaPagoRepository
      .createQueryBuilder('p')
      .innerJoin(Venta, 'v', 'v.id = p.id_venta')
      .select([
        'p.id AS id', 'p.id_venta AS id_venta', `CONVERT(varchar(10), p.fecha_pago, 23) AS fecha_pago`,
        'p.id_forma_pago AS id_forma_pago', 'p.monto AS monto', 'p.n_comprobante AS n_comprobante',
        'p.id_empl AS id_empl', 'p.label_nombres_apellidos_empl AS label_nombres_apellidos_empl',
        'p.label_nombres_apellidos_cli AS label_nombres_apellidos_cli', 'v.label_documento_cli AS label_documento_cli',
        'v.id_tipo_cli AS id_tipo_cli', 'v.label_tipo_cli AS label_tipo_cli',
        'v.montoTotal_membresia AS montoTotal_membresia', 'v.montoTotal_productos AS montoTotal_productos',
      ])
      .where('p.flag = 1 AND v.flag = 1')
      .andWhere('p.fecha_pago BETWEEN :fechaDesde AND :fechaHasta', { fechaDesde, fechaHasta })
      .orderBy('p.fecha_pago', 'ASC')
      .getRawMany();

    return {
      // monto_venta: total de la venta del pago (membresías + productos)
      lista: lista.map(({ montoTotal_membresia, montoTotal_productos, ...pago }) => ({
        ...pago,
        monto: Number(pago.monto) || 0,
        monto_venta: (Number(montoTotal_membresia) || 0) + (Number(montoTotal_productos) || 0),
      })),
      total: lista.length
    }
  }

  async findByIdVenta(id_venta: number) {
    return await this.detalleventaPagoRepository.find({ where: { id_venta, flag: true } });
  }

  async findOne(id: number) {
    const detalleventaPago = await this.detalleventaPagoRepository.findOne({
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
        id_forma_pago: true,
        monto: true,
        fecha_pago: true,
        observacion: true
      }
    });
    if (!detalleventaPago) throw new NotFoundException(`DetalleventaPago with id ${id} not found`);
    return detalleventaPago;
  }

  async update(id: number, updateDetalleventaPagoDto: UpdateDetalleventaPagoDto) {
    const anterior = await this.detalleventaPagoRepository.findOne({ where: { id } });
    const labels = await this.getLabels(updateDetalleventaPagoDto);
    const detalleventaPago = await this.detalleventaPagoRepository.preload({
      id,
      ...updateDetalleventaPagoDto,
      ...labels
    });
    if (!detalleventaPago) throw new BadRequestException(`DetalleventaPago with id ${id} not found`);
    try {
      await this.detalleventaPagoRepository.save(detalleventaPago);
      await this.recalcularMontoPagos(detalleventaPago.id_venta);
      if (anterior?.id_venta !== undefined && anterior.id_venta !== detalleventaPago.id_venta) {
        await this.recalcularMontoPagos(anterior.id_venta);
      }
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async removeByIdVenta(id_venta: number) {
    const result = await this.detalleventaPagoRepository.update(
      { id_venta },
      { flag: false }
    );
    await this.recalcularMontoPagos(id_venta);
    return result;
  }

  async remove(id: number) {
    const detalleventaPago = await this.detalleventaPagoRepository.findOne({ where: { id } });
    const result = await this.detalleventaPagoRepository.update(id, { flag: false });
    await this.recalcularMontoPagos(detalleventaPago?.id_venta);
    return result;
  }

  private handleDBExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  }
}
