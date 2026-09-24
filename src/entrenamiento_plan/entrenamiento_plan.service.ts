import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntrenamientoPlanDto } from './dto/create-entrenamiento_plan.dto';
import { UpdateEntrenamientoPlanDto } from './dto/update-entrenamiento_plan.dto';
import { EntrenamientoPlan } from './entities/entrenamiento_plan.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class EntrenamientoPlanService {
  private readonly logger = new Logger('EntrenamientoPlanService')
  constructor(
    @InjectRepository(EntrenamientoPlan)
    private readonly entrenamientoPlanRepository: Repository<EntrenamientoPlan>,
    @InjectRepository(ProgramaEntrenamiento)
    private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getProgramaLabel(dto: { id_programa?: number }) {
    const labels: Partial<EntrenamientoPlan> = {};
    if (dto.id_programa === undefined || dto.id_programa === null) return labels;

    const programa = await this.programaEntrenamientoRepository.findOneBy({ id: dto.id_programa });
    if (programa) labels.label_programa = programa.nombre;

    return labels;
  }

  private async getTerminologiaLabel(dto: { id_tipo_tarifa?: number }) {
    const labels: Partial<EntrenamientoPlan> = {};
    if (dto.id_tipo_tarifa === undefined || dto.id_tipo_tarifa === null) return labels;

    const terminologia = await this.terminologiaRepository.findOneBy({ id: dto.id_tipo_tarifa });
    if (terminologia) labels.label_tipo_tarifa = terminologia.valor;

    return labels;
  }

  async create(createEntrenamientoPlanDto: CreateEntrenamientoPlanDto) {
    try {
      const programaLabel = await this.getProgramaLabel(createEntrenamientoPlanDto);
      const tarifaLabel = await this.getTerminologiaLabel(createEntrenamientoPlanDto);
      const entrenamientoPlan = this.entrenamientoPlanRepository.create({
        ...createEntrenamientoPlanDto,
        ...programaLabel,
        ...tarifaLabel
      })
      await this.entrenamientoPlanRepository.save(entrenamientoPlan)
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
    const [ lista, total ] = await this.entrenamientoPlanRepository.findAndCount({
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
    return await this.entrenamientoPlanRepository.findOne({ where: { id, flag: true } });
  }

  async findAllByPrograma(id_programa: number) {
    const [ lista, total ] = await this.entrenamientoPlanRepository.findAndCount({
      where: {
        flag: true,
        id_programa
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

  async update(id: number, updateEntrenamientoPlanDto: UpdateEntrenamientoPlanDto) {
    const programaLabel = await this.getProgramaLabel(updateEntrenamientoPlanDto);
    const tarifaLabel = await this.getTerminologiaLabel(updateEntrenamientoPlanDto);
    const entrenamientoPlan = await this.entrenamientoPlanRepository.preload({
      id,
      ...updateEntrenamientoPlanDto,
      ...programaLabel,
      ...tarifaLabel
    });
    if (!entrenamientoPlan) throw new BadRequestException(`EntrenamientoPlan with id ${id} not found`);
    try {
      await this.entrenamientoPlanRepository.save(entrenamientoPlan);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.entrenamientoPlanRepository.update(id, { flag: false });
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
      EntrenamientoPlan,
      [
        'label_programa',
        'label_tipo_tarifa'
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
