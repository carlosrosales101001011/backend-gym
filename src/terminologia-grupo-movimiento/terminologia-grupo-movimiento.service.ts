import { Injectable, Logger, BadRequestException, InternalServerErrorException, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TerminologiaGrupoMovimiento } from './entities/terminologia-grupo-movimiento.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateTerminologiaGrupoMovimientoDto } from './dto/create-terminologia-grupo-movimiento.dto';
import { UpdateTerminologiaGrupoMovimientoDto } from './dto/update-terminologia-grupo-movimiento.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class TerminologiaGrupoMovimientoService {
  private readonly logger = new Logger('TerminologiaGrupoMovimientoService')
      constructor(
        @InjectRepository(TerminologiaGrupoMovimiento)
        private readonly terminologiaGrupoMovimientoRepository: Repository<TerminologiaGrupoMovimiento>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}
  async create(createTerminologiaGrupoMovimientoDto: CreateTerminologiaGrupoMovimientoDto) {
    try {
      const terminologiaGrupoMovimiento = this.terminologiaGrupoMovimientoRepository.create({
        ...createTerminologiaGrupoMovimientoDto
      })
      await this.terminologiaGrupoMovimientoRepository.save(terminologiaGrupoMovimiento)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto, id_tipo_movimiento: number) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.terminologiaGrupoMovimientoRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
        id_tipo_movimiento,
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

  async findSearch (  q: string,
    paginationDto: PaginationDto,
    id_tipo_movimiento?: number
){
  const { offset, show } = paginationDto;

  if (q.trim().length===0) {
    const { lista, total } = await this.findAll(paginationDto, id_tipo_movimiento || 0);
    return {
      items: lista,
      total
    }
  }
  const {items, total} =await this.fullTextSearchService.search(
      TerminologiaGrupoMovimiento,
      [
        'nombre',
        'descripcion'
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

  async findOne(id: number) {
    return await this.terminologiaGrupoMovimientoRepository.findOne({where: {id, flag: true}, select: {
      id: true,
      nombre: true,
      descripcion: true,
      id_tipo_movimiento: true,
      orden: true,
      flag: false,
    }});
  }

  async update(id: number, updateTerminologiaGrupoMovimientoDto: UpdateTerminologiaGrupoMovimientoDto) {
    const terminologiaGrupoMovimiento = await this.terminologiaGrupoMovimientoRepository.preload({
      id,
      ...updateTerminologiaGrupoMovimientoDto
    });
    if (!terminologiaGrupoMovimiento) throw new BadRequestException(`TerminologiaGrupoMovimiento with id ${id} not found`);
    try {
      await this.terminologiaGrupoMovimientoRepository.save(terminologiaGrupoMovimiento);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.terminologiaGrupoMovimientoRepository.update(id, {flag: false});
  }
      private handleDBExceptions(error:any){
        if(error.code === '23505')
          throw new BadRequestException(error.detail);
        this.logger.error(error);
        throw new InternalServerErrorException('Ayuda!')
      } 
}
