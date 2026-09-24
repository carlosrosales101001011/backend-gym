import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateMovimientoFinancieroDto } from './dto/create-movimiento-financiero.dto';
import { UpdateMovimientoFinancieroDto } from './dto/update-movimiento-financiero.dto';
import { MovimientoFinanciero } from './entities/movimiento-financiero.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { In } from 'typeorm';

@Injectable()
export class MovimientoFinancieroService {
    private readonly logger = new Logger('movimientoFinancieroService')
  constructor(
    @InjectRepository(MovimientoFinanciero)
    private readonly movimientoFinancieroRepository:Repository<MovimientoFinanciero>,
    @InjectRepository(Persona)
    private readonly personaRepository: Repository<Persona>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getPersonaLabels(dto: {
    id_proveedor?: number;
  }) {
    const labels: Partial<MovimientoFinanciero> = {};
    if (dto.id_proveedor === undefined || dto.id_proveedor === null) return labels;

    const persona = await this.personaRepository.findOneBy({ id: dto.id_proveedor });
    if (persona) {
      labels.label_proveedor = `${persona.label_tipo_documento}: ${persona.numero_documento} | nombre: ${persona.nombres}`;
    }

    return labels;
  }

  private async getTerminologiaLabels(dto: {
    id_tipo_comprobante?: number;
  }) {
    const ids = [dto.id_tipo_comprobante]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<MovimientoFinanciero> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_tipo_comprobante !== undefined) labels.label_tipo_comprobante = valorPorId.get(dto.id_tipo_comprobante);

    return labels;
  }

  async create(createMovimientoFinancieroDto: CreateMovimientoFinancieroDto) {
    try {
        const personaLabels = await this.getPersonaLabels(createMovimientoFinancieroDto);
        const terminologiaLabels = await this.getTerminologiaLabels(createMovimientoFinancieroDto);
        const movimientoFinanciero = this.movimientoFinancieroRepository.create({
          ...createMovimientoFinancieroDto,
          ...personaLabels,
          ...terminologiaLabels
        })
        await this.movimientoFinancieroRepository.save(movimientoFinanciero);
        return {
          ok: true,
          id: movimientoFinanciero.id,
          msg: 'creado con exito'
        };
      } catch (error) {
        this.handleDBExceptions(error);
      }
  }

  async findAll(id_tipo_movimiento: number, paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.movimientoFinancieroRepository.findAndCount({
          take: show,
          skip: offset,
          where: {
            flag: true,
            id_tipo_movimiento
          },
          relations: {
            tipoComprobante: true
          },
          order: {
            id: 'ASC'
          }
        });
        console.log({lista, total});
        
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
      const {lista, total} = await this.findAll(id_tipo_movimiento || 0, paginationDto);
      return {
        items: lista,
        total
      }
    }
    const {items, total} =await this.fullTextSearchService.search(
        MovimientoFinanciero,
        [
          'fecha_comprobante',
          'id_tipo_movimiento',
          'id_proveedor',
          'observacion',
          'monto_detalle',
          'monto_pagos',
          'n_comprobante'
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
  
  async findOne(id_tipo_movimiento: number, id: number) {
      const movimientoFinanciero =await this.movimientoFinancieroRepository.findOneBy({id, id_tipo_movimiento, flag: true});
      if(!movimientoFinanciero){
        throw new NotFoundException(`movimientoFinanciero whith termino ${id} not found`)
      }
      return movimientoFinanciero;
  }



  async update(id: number, updateMovimientoFinancieroDto: UpdateMovimientoFinancieroDto) {
    try {
      const personaLabels = await this.getPersonaLabels(updateMovimientoFinancieroDto);
      const terminologiaLabels = await this.getTerminologiaLabels(updateMovimientoFinancieroDto);
      const movimientoFinanciero = await this.movimientoFinancieroRepository.preload({
        id,
        ...updateMovimientoFinancieroDto,
        ...personaLabels,
        ...terminologiaLabels
      })
      if(!movimientoFinanciero) throw new NotFoundException(`movimientoFinanciero with id: ${id} not found`)
      await this.movimientoFinancieroRepository.save({id, ...movimientoFinanciero})
      return movimientoFinanciero;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.update(id, {flag: false})
    return {
      msg: `El movimientoFinanciero con id ${id}, se eliminó`
    };
  }
    private handleDBExceptions(error:any){
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error);
      throw new InternalServerErrorException('Ayuda!')
    } 
}
