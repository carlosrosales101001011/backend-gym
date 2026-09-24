import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTerminologiaDto } from './dto/create-terminologia.dto';
import { UpdateTerminologiaDto } from './dto/update-terminologia.dto';
import { MoreThan, Repository } from 'typeorm';
import { Terminologia } from './entities/terminologia.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import * as UID from 'uuid'
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
@Injectable()
export class TerminologiaService {
    private readonly logger = new Logger('terminologiaService')
  constructor(
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository:Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService,
  ){}
  async create(createTerminologiaDto: CreateTerminologiaDto) {
    try {
      const terminologia = this.terminologiaRepository.create(createTerminologiaDto)
      await this.terminologiaRepository.save({...terminologia, uuid: UID.v4() })
      return {
        ok: true,
        msg: 'creado con exit'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    const [lista, total] = await this.terminologiaRepository.findAndCount({
        order: {
          id: 'DESC'
        },
      });
      
      return {
      lista,
      total
    }
  }

  async findSearch (  q: string,
    paginationDto: PaginationDto
){
  const { offset, show } = paginationDto;
  
  if (q.trim().length===0) {
    const [lista, total] = await this.terminologiaRepository.findAndCount({
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
      Terminologia,
      [
        'entidad',
        'grupo',
        "subgrupo",
        "valor"
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


  async findAllbyEntidadGrupoAndSubGrupo(entidad:string, grupo:string, subgrupo:string) {
    const [lista, total] = await this.terminologiaRepository.findAndCount({
        where: {
          entidad,
          grupo,
          subgrupo,
          flag: true
        },
        order: {
          id: 'DESC'
        }
      });
      return lista.map(m=>{
        return {
          value: m.id,
          label: m.valor
        }
      });
  }

  async findOne(id: number) {
    const terminologia =await this.terminologiaRepository.findOneBy({id})
    
    if(!terminologia){
      throw new NotFoundException(`terminologia whith termino ${id} not found`)
    }
    return terminologia;
  }

  async update(id: number, updateTerminologiaDto: UpdateTerminologiaDto) {
    try {
      const terminologia = await this.terminologiaRepository.preload({
        id,
        ...updateTerminologiaDto
      })
      if(!terminologia) throw new NotFoundException(`Terminologia with id: ${id} not found`)
      await this.terminologiaRepository.save(terminologia)
      return terminologia;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.update(id, {flag: false})
    return {
      msg: `La terminologia con id ${id}, se eliminó`
    };
  }
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  } 
}
