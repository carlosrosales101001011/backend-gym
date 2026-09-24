import { Injectable } from '@nestjs/common';
import { Logger, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Seccion } from './entities/seccion.entity';
import { UpdateSeccionDto } from './dto/update-seccion.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
@Injectable()
export class SeccionService {
  private readonly logger = new Logger('seccionService');
  constructor(
    @InjectRepository(Seccion)
    private readonly seccionRepository:Repository<Seccion>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}
  async create(createSeccionDto: CreateSeccionDto) {
    try {
      const seccion = this.seccionRepository.create({
        ...createSeccionDto,
      })
      await this.seccionRepository.save(seccion);
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
      const [ lista, total ] = await this.seccionRepository.findAndCount({
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
    const seccion =await this.seccionRepository.findOneBy({id})
    if(!seccion){
      throw new NotFoundException(`seccion whith termino ${id} not found`)
    }
    return seccion;
  }
  async update(id: number, updateSeccionDto: UpdateSeccionDto) {
    try {
      const seccion = await this.seccionRepository.preload({
        id,
        ...updateSeccionDto
      })
      if(!seccion) throw new NotFoundException(`Seccion with id: ${id} not found`)
      await this.seccionRepository.save({id, ...seccion})
      return seccion;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.update(id, {flag: false})
    return {
      msg: `La seccion con id ${id}, se eliminó`
    };
  }
  async findSearch (  q: string,
    paginationDto: PaginationDto
  ){
    const { offset, show } = paginationDto;

    if (q.trim().length===0) {
      const [lista, total] = await this.seccionRepository.findAndCount({
            order: {
              id: 'DESC'
            },
            take: show,
            skip: offset,
          });
      return {
        items: lista,
        total
      }
    }
    const {items, total} =await this.fullTextSearchService.search(
        Seccion,
        [
          'label',
          'subSeccion',
          'url',
          'parentKey'
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
