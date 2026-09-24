import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetalleventaMembresiaDto } from './dto/create-detalleventa_membresia.dto';
import { UpdateDetalleventaMembresiaDto } from './dto/update-detalleventa_membresia.dto';
import { DetalleventaMembresia } from './entities/detalleventa_membresia.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { EntrenamientoPlan } from 'src/entrenamiento_plan/entities/entrenamiento_plan.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EntrenamientoHorario } from 'src/entrenamiento_horario/entities/entrenamiento_horario.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { recalcularTotalesVenta } from 'src/common/helpers/recalcular-totales-venta';
import { MembresiaSeguimientoService } from 'src/membresia-seguimiento/membresia-seguimiento.service';

@Injectable()
export class DetalleventaMembresiasService {
  private readonly logger = new Logger('DetalleventaMembresiasService')
      constructor(
        @InjectRepository(DetalleventaMembresia)
        private readonly detalleventaMembresiaRepository: Repository<DetalleventaMembresia>,
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        @InjectRepository(EntrenamientoPlan)
        private readonly entrenamientoPlanRepository: Repository<EntrenamientoPlan>,
        @InjectRepository(ProgramaEntrenamiento)
        private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
        @InjectRepository(EntrenamientoHorario)
        private readonly entrenamientoHorarioRepository: Repository<EntrenamientoHorario>,
        private readonly fullTextSearchService: FullTextSearchService,
        private readonly membresiaSeguimientoService: MembresiaSeguimientoService
      ){
        // Backfill puntual: recalcula los datos derivados de Venta en TODA la data de
        // DetalleventaMembresia. Descomentar únicamente cuando se necesite ejecutar.
        // this.obtenerDetalleVentaMembresiaCarcel();
      }

  // Recorre TODA la tabla detalleventa_membresia y copia desde su venta (id_venta = venta.id)
  // los campos derivados: label_venta, id_cli, id_empl, id_origen, id_sucursal,
  // id_tipo_comprobante, n_comprobante y sus label_*.
  // Se carga la tabla venta completa (sin In(...)) para no superar el límite de 2100 parámetros de SQL Server.
  private async obtenerDetalleVentaMembresiaCarcel() {
    const detalles = await this.detalleventaMembresiaRepository.find();
    if (detalles.length === 0) return;

    const ventas = await this.ventaRepository.find();
    const ventaPorId = new Map(ventas.map(v => [v.id, v]));

    const actualizados: DetalleventaMembresia[] = [];
    for (const detalle of detalles) {
      const venta = detalle.id_venta !== undefined ? ventaPorId.get(detalle.id_venta) : undefined;
      if (!venta) continue;
      detalle.label_venta = venta.n_comprobante;
      detalle.id_cli = venta.id_cli;
      detalle.label_nombres_apellidos_cli = venta.label_nombres_apellidos_cli;
      detalle.id_empl = venta.id_empl;
      detalle.label_nombres_apellidos_empl = venta.label_nombres_apellidos_empl;
      detalle.id_origen = venta.id_origen;
      detalle.label_origen = venta.label_origen;
      detalle.id_sucursal = venta.id_sucursal;
      detalle.label_sucursal = venta.label_sucursal;
      detalle.id_tipo_comprobante = venta.id_tipo_comprobante;
      detalle.label_tipo_comprobante = venta.label_tipo_comprobante;
      detalle.n_comprobante = venta.n_comprobante;
      actualizados.push(detalle);
    }

    await this.detalleventaMembresiaRepository.save(actualizados, { chunk: 100 });
    this.logger.log(`obtenerDetalleVentaMembresiaCarcel: ${actualizados.length} de ${detalles.length} detalles actualizados`);
  }

  // Recalcula los totales de la venta y sincroniza su membresia-seguimiento con la fecha_fin.
  private async sincronizarVenta(detalle: DetalleventaMembresia) {
    if (detalle.id_venta === undefined) return;
    await recalcularTotalesVenta(this.detalleventaMembresiaRepository.manager, detalle.id_venta);
    if (detalle.fecha_fin) {
      await this.membresiaSeguimientoService.sincronizarPorVenta(detalle.id_venta, detalle.id_cli, detalle.fecha_fin);
    }
  }

  private async getLabels(dto: {
    id_venta?: number;
    id_plan?: number;
    id_programa?: number;
    id_horario?: number;
  }) {
    const labels: Partial<DetalleventaMembresia> = {};

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

    if (dto.id_plan !== undefined) {
      const plan = await this.entrenamientoPlanRepository.findOne({ where: { id: dto.id_plan } });
      labels.nMeses_plan = plan?.nMeses;
      labels.label_plan = plan?.nMeses !== undefined ? `${plan.nMeses} Meses` : undefined;
      labels.dias_congelamiento_regalo = plan?.dias_congelamiento_regalo;
      labels.citas_nutricion_regalo = plan?.citas_nutricion_regalo;
    }

    if (dto.id_programa !== undefined) {
      const programa = await this.programaEntrenamientoRepository.findOne({ where: { id: dto.id_programa } });
      labels.label_programa = programa?.nombre;
    }

    if (dto.id_horario !== undefined) {
      const horario = await this.entrenamientoHorarioRepository.findOne({ where: { id: dto.id_horario } });
      labels.label_horario = horario
        ? `${horario.horarioInicio} - ${horario.horarioFin}`
        : undefined;
    }

    return labels;
  }

  async create(createDetalleventaMembresiaDto: CreateDetalleventaMembresiaDto) {
    const { id_venta } = createDetalleventaMembresiaDto;
    const existente = await this.detalleventaMembresiaRepository.findOne({ where: { id_venta, flag: true } });
    if (existente) throw new BadRequestException(`La venta ${id_venta} ya tiene una membresía`);
    try {
      const labels = await this.getLabels(createDetalleventaMembresiaDto);
      const detalleventaMembresia = this.detalleventaMembresiaRepository.create({
        ...createDetalleventaMembresiaDto,
        ...labels
      })
      
      await this.detalleventaMembresiaRepository.save(detalleventaMembresia)
      await this.sincronizarVenta(detalleventaMembresia)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async createBulk(createDetalleventaMembresiaDtos: CreateDetalleventaMembresiaDto[]) {
    try {
      const detallesConLabels = await Promise.all(
        createDetalleventaMembresiaDtos.map(async (dto) => {
          const labels = await this.getLabels(dto);
          return {
            ...dto,
            ...labels
          };
        })
      );
      const detalleventaMembresias = this.detalleventaMembresiaRepository.create(detallesConLabels);
      await this.detalleventaMembresiaRepository.save(detalleventaMembresias);
      for (const detalle of detalleventaMembresias) await this.sincronizarVenta(detalle);
      return {
        ok: true,
        msg: 'creados con exito'
      };
    } catch (error) {
      console.log({error});
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.detalleventaMembresiaRepository.findAndCount({
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
    return await this.detalleventaMembresiaRepository.findOne({
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
        id_plan: true, label_plan: false, nMeses_plan: true,
        id_programa: true, label_programa: false,
        id_horario: true, label_horario: false,
        fecha_inicio: true,
        fecha_fin: true,
        montoTotal: true,
        montoDescuento: true,
        montoSinDescuento: true,
        dias_congelamiento_regalo: true,
        citas_nutricion_regalo: true
      }
    });
  }

  async update(id: number, updateDetalleventaMembresiaDto: UpdateDetalleventaMembresiaDto) {
    const labels = await this.getLabels(updateDetalleventaMembresiaDto);
    const detalleventaMembresia = await this.detalleventaMembresiaRepository.preload({
      id,
      ...updateDetalleventaMembresiaDto,
      ...labels
    });
    if (!detalleventaMembresia) throw new BadRequestException(`DetalleventaMembresia with id ${id} not found`);
    try {
      await this.detalleventaMembresiaRepository.save(detalleventaMembresia);
      await this.sincronizarVenta(detalleventaMembresia);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const detalleventaMembresia = await this.detalleventaMembresiaRepository.findOne({ where: { id } });
    const result = await this.detalleventaMembresiaRepository.update(id, {flag: false});
    if (detalleventaMembresia?.id_venta !== undefined) {
      await recalcularTotalesVenta(this.detalleventaMembresiaRepository.manager, detalleventaMembresia.id_venta);
      await this.membresiaSeguimientoService.desactivarPorVenta(detalleventaMembresia.id_venta);
    }
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
      DetalleventaMembresia,
      [
        'label_venta',
        'label_nombres_apellidos_cli',
        'label_nombres_apellidos_empl',
        'label_origen',
        'label_sucursal',
        'label_tipo_comprobante',
        'n_comprobante',
        'label_plan',
        'label_programa',
        'label_horario'
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
