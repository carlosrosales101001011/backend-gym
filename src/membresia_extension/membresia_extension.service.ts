import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembresiaExtensionDto } from './dto/create-membresia_extension.dto';
import { UpdateMembresiaExtensionDto } from './dto/update-membresia_extension.dto';
import { MembresiaExtension } from './entities/membresia_extension.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EntrenamientoPlan } from 'src/entrenamiento_plan/entities/entrenamiento_plan.entity';
import { MembresiaSeguimientoService } from 'src/membresia-seguimiento/membresia-seguimiento.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const ID_TIPO_EXTENSION_POR_FECHAS = 6089;
const ID_TIPO_EXTENSION_POR_DIAS_HABILES = 6090;

@Injectable()
export class MembresiaExtensionService {
  private readonly logger = new Logger('MembresiaExtensionService')
      constructor(
        @InjectRepository(MembresiaExtension)
        private readonly membresiaExtensionRepository: Repository<MembresiaExtension>,
        @InjectRepository(Venta)
        private readonly ventaRepository: Repository<Venta>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        @InjectRepository(ProgramaEntrenamiento)
        private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
        @InjectRepository(EntrenamientoPlan)
        private readonly entrenamientoPlanRepository: Repository<EntrenamientoPlan>,
        private readonly membresiaSeguimientoService: MembresiaSeguimientoService,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_venta?: number;
    id_tipo_extension?: number;
    id_programa?: number;
    id_plan?: number;
  }) {
    const labels: Partial<MembresiaExtension> = {};

    if (dto.id_venta !== undefined) {
      const venta = await this.ventaRepository.findOne({ where: { id: dto.id_venta } });
      labels.label_venta = venta?.n_comprobante;
      labels.id_cli = venta?.id_cli;
      labels.label_nombres_apellidos_cli = venta?.label_nombres_apellidos_cli;
    }

    if (dto.id_tipo_extension !== undefined) {
      const tipoExtension = await this.terminologiaRepository.findOne({ where: { id: dto.id_tipo_extension } });
      labels.label_tipo_extension = tipoExtension?.valor;
    }

    if (dto.id_programa !== undefined) {
      const programa = await this.programaEntrenamientoRepository.findOne({ where: { id: dto.id_programa } });
      labels.label_nombre_programa = programa?.nombre;
    }

    if (dto.id_plan !== undefined) {
      const plan = await this.entrenamientoPlanRepository.findOne({ where: { id: dto.id_plan } });
      labels.label_nmes_plan = plan?.nMeses !== undefined ? `${plan.nMeses} Meses` : undefined;
    }

    return labels;
  }

  async create(createMembresiaExtensionDto: CreateMembresiaExtensionDto) {
    const { id_cli, id_tipo_extension } = createMembresiaExtensionDto;

    const seguimiento = await this.membresiaSeguimientoService.findUltimaActivaByIdCli(id_cli);
    if (!seguimiento || !seguimiento.fecha_vencimiento) {
      throw new BadRequestException(`No se encontró una membresía vigente (membresia-seguimiento) para el cliente ${id_cli}`);
    }
    const fechaVencimientoActual: Date = seguimiento.fecha_vencimiento;

    let fecha_inicio: Date;
    let fecha_fin: Date;
    let dias_habiles: number;

    if (id_tipo_extension === ID_TIPO_EXTENSION_POR_FECHAS) {
      if (!createMembresiaExtensionDto.fecha_inicio || !createMembresiaExtensionDto.fecha_fin) {
        throw new BadRequestException('fecha_inicio y fecha_fin son obligatorios cuando id_tipo_extension es 6089');
      }
      fecha_inicio = new Date(createMembresiaExtensionDto.fecha_inicio);
      fecha_fin = new Date(createMembresiaExtensionDto.fecha_fin);
      if (fecha_fin.getTime() < fecha_inicio.getTime()) {
        throw new BadRequestException('fecha_fin no puede ser anterior a fecha_inicio');
      }
      dias_habiles = Math.round((fecha_fin.getTime() - fecha_inicio.getTime()) / MS_POR_DIA) + 1;
    } else {
      // ID_TIPO_EXTENSION_POR_DIAS_HABILES (6090)
      if (!createMembresiaExtensionDto.dias_habiles || createMembresiaExtensionDto.dias_habiles <= 0) {
        throw new BadRequestException('dias_habiles es obligatorio (y mayor a 0) cuando id_tipo_extension es 6090');
      }
      dias_habiles = createMembresiaExtensionDto.dias_habiles;
      fecha_inicio = new Date(fechaVencimientoActual);
      fecha_fin = new Date(fecha_inicio.getTime() + dias_habiles * MS_POR_DIA);
    }

    const nuevaFechaVencimiento = id_tipo_extension === ID_TIPO_EXTENSION_POR_FECHAS
      ? new Date(fechaVencimientoActual.getTime() + dias_habiles * MS_POR_DIA)
      : fecha_fin;

    try {
      const labels = await this.getLabels(createMembresiaExtensionDto);
      const membresiaExtension = this.membresiaExtensionRepository.create({
        ...createMembresiaExtensionDto,
        ...labels,
        fecha_inicio,
        fecha_fin,
        dias_habiles
      })
      await this.membresiaExtensionRepository.save(membresiaExtension)

      await this.membresiaSeguimientoService.update(seguimiento.id!, {
        fecha_vencimiento: nuevaFechaVencimiento,
        id_extension_actual: membresiaExtension.id
      });

      return {
        ok: true,
        id: membresiaExtension.id,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.membresiaExtensionRepository.findAndCount({
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
    return await this.membresiaExtensionRepository.findOne({
      where: { id, flag: true },
      select: {
        id: true,
        id_tipo_extension: true, label_tipo_extension: false,
        id_venta: true, label_venta: false,
        id_cli: true, label_nombres_apellidos_cli: false,
        id_programa: true, label_nombre_programa: false,
        id_plan: true, label_nmes_plan: false,
        fecha_inicio: true,
        fecha_fin: true,
        dias_habiles: true,
        observacion: true
      }
    });
  }

  async update(id: number, updateMembresiaExtensionDto: UpdateMembresiaExtensionDto) {
    const labels = await this.getLabels(updateMembresiaExtensionDto);
    const membresiaExtension = await this.membresiaExtensionRepository.preload({
      id,
      ...updateMembresiaExtensionDto,
      ...labels
    });
    if (!membresiaExtension) throw new BadRequestException(`MembresiaExtension with id ${id} not found`);
    try {
      await this.membresiaExtensionRepository.save(membresiaExtension);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.membresiaExtensionRepository.update(id, {flag: false});
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
      MembresiaExtension,
      [
        'label_venta',
        'label_nombres_apellidos_cli',
        'label_tipo_extension',
        'label_nombre_programa',
        'label_nmes_plan'
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
