import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEntrenamientoSucursaleDto } from './dto/create-entrenamiento_sucursale.dto';
import { UpdateEntrenamientoSucursaleDto } from './dto/update-entrenamiento_sucursale.dto';
import { EntrenamientoSucursale } from './entities/entrenamiento_sucursale.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class EntrenamientoSucursalesService {
  private readonly logger = new Logger('EntrenamientoSucursalesService')
  constructor(
    @InjectRepository(EntrenamientoSucursale)
    private readonly entrenamientoSucursaleRepository: Repository<EntrenamientoSucursale>,
    @InjectRepository(ProgramaEntrenamiento)
    private readonly programaEntrenamientoRepository: Repository<ProgramaEntrenamiento>,
    @InjectRepository(EmpresaSucursal)
    private readonly empresaSucursalRepository: Repository<EmpresaSucursal>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getProgramaLabel(dto: { id_programa?: number }) {
    const labels: Partial<EntrenamientoSucursale> = {};
    if (dto.id_programa === undefined || dto.id_programa === null) return labels;

    const programa = await this.programaEntrenamientoRepository.findOneBy({ id: dto.id_programa });
    if (programa) labels.label_programa = programa.nombre;

    return labels;
  }

  private async getSucursalLabel(dto: { id_sucursal?: number }) {
    const labels: Partial<EntrenamientoSucursale> = {};
    if (dto.id_sucursal === undefined || dto.id_sucursal === null) return labels;

    const sucursal = await this.empresaSucursalRepository.findOneBy({ id: dto.id_sucursal });
    if (sucursal) labels.label_sucursal = sucursal.nombre;

    return labels;
  }

  async create(createEntrenamientoSucursaleDto: CreateEntrenamientoSucursaleDto) {
    try {
      const programaLabel = await this.getProgramaLabel(createEntrenamientoSucursaleDto);
      const sucursalLabel = await this.getSucursalLabel(createEntrenamientoSucursaleDto);
      const entrenamientoSucursale = this.entrenamientoSucursaleRepository.create({
        ...createEntrenamientoSucursaleDto,
        ...programaLabel,
        ...sucursalLabel
      })
      await this.entrenamientoSucursaleRepository.save(entrenamientoSucursale)
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
    const [ lista, total ] = await this.entrenamientoSucursaleRepository.findAndCount({
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
    return await this.entrenamientoSucursaleRepository.findOne({ where: { id, flag: true } });
  }

  async findAllByPrograma(id_programa: number) {
    const [ lista, total ] = await this.entrenamientoSucursaleRepository.findAndCount({
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

  async update(id: number, updateEntrenamientoSucursaleDto: UpdateEntrenamientoSucursaleDto) {
    const programaLabel = await this.getProgramaLabel(updateEntrenamientoSucursaleDto);
    const sucursalLabel = await this.getSucursalLabel(updateEntrenamientoSucursaleDto);
    const entrenamientoSucursale = await this.entrenamientoSucursaleRepository.preload({
      id,
      ...updateEntrenamientoSucursaleDto,
      ...programaLabel,
      ...sucursalLabel
    });
    if (!entrenamientoSucursale) throw new BadRequestException(`EntrenamientoSucursale with id ${id} not found`);
    try {
      await this.entrenamientoSucursaleRepository.save(entrenamientoSucursale);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.entrenamientoSucursaleRepository.update(id, { flag: false });
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
      EntrenamientoSucursale,
      [
        'label_programa',
        'label_sucursal'
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
