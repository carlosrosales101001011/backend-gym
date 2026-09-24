import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntrenamientoCategoriaDto } from './dto/create-entrenamiento_categoria.dto';
import { UpdateEntrenamientoCategoriaDto } from './dto/update-entrenamiento_categoria.dto';
import { EntrenamientoCategoria } from './entities/entrenamiento_categoria.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class EntrenamientoCategoriaService {
  private readonly logger = new Logger('EntrenamientoCategoriaService')
  constructor(
    @InjectRepository(EntrenamientoCategoria)
    private readonly entrenamientoCategoriaRepository: Repository<EntrenamientoCategoria>,
    @InjectRepository(ProgramaEntrenamiento)
    private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getProgramaLabel(dto: { id_programa?: number }) {
    const labels: Partial<EntrenamientoCategoria> = {};
    if (dto.id_programa === undefined || dto.id_programa === null) return labels;

    const programa = await this.programaEntrenamientoRepository.findOneBy({ id: dto.id_programa });
    if (programa) labels.label_programa = programa.nombre;

    return labels;
  }

  private async getTerminologiaLabel(dto: { id_categoria?: number }) {
    const labels: Partial<EntrenamientoCategoria> = {};
    if (dto.id_categoria === undefined || dto.id_categoria === null) return labels;

    const terminologia = await this.terminologiaRepository.findOneBy({ id: dto.id_categoria });
    if (terminologia) labels.label_categoria = terminologia.valor;

    return labels;
  }

  async create(createEntrenamientoCategoriaDto: CreateEntrenamientoCategoriaDto) {
    try {
      const programaLabel = await this.getProgramaLabel(createEntrenamientoCategoriaDto);
      const categoriaLabel = await this.getTerminologiaLabel(createEntrenamientoCategoriaDto);
      const entrenamientoCategoria = this.entrenamientoCategoriaRepository.create({
        ...createEntrenamientoCategoriaDto,
        ...programaLabel,
        ...categoriaLabel
      })
      await this.entrenamientoCategoriaRepository.save(entrenamientoCategoria)
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
    const [ lista, total ] = await this.entrenamientoCategoriaRepository.findAndCount({
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
    return await this.entrenamientoCategoriaRepository.findOne({ where: { id, flag: true } });
  }

  async findAllByPrograma(id_programa: number) {
    const [ lista, total ] = await this.entrenamientoCategoriaRepository.findAndCount({
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

  async update(id: number, updateEntrenamientoCategoriaDto: UpdateEntrenamientoCategoriaDto) {
    const programaLabel = await this.getProgramaLabel(updateEntrenamientoCategoriaDto);
    const categoriaLabel = await this.getTerminologiaLabel(updateEntrenamientoCategoriaDto);
    const entrenamientoCategoria = await this.entrenamientoCategoriaRepository.preload({
      id,
      ...updateEntrenamientoCategoriaDto,
      ...programaLabel,
      ...categoriaLabel
    });
    if (!entrenamientoCategoria) throw new BadRequestException(`EntrenamientoCategoria with id ${id} not found`);
    try {
      await this.entrenamientoCategoriaRepository.save(entrenamientoCategoria);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.entrenamientoCategoriaRepository.update(id, { flag: false });
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
      EntrenamientoCategoria,
      [
        'label_programa',
        'label_categoria'
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
