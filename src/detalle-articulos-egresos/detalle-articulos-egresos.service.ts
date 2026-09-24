import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetalleArticulosEgresoDto } from './dto/create-detalle-articulos-egreso.dto';
import { UpdateDetalleArticulosEgresoDto } from './dto/update-detalle-articulos-egreso.dto';
import { DetalleArticulosEgreso } from './entities/detalle-articulos-egreso.entity';

@Injectable()
export class DetalleArticulosEgresosService {
        private readonly logger = new Logger('DetalleArticulosEgresosService')
    constructor(
      @InjectRepository(DetalleArticulosEgreso)
      private readonly detalleArticulosEgresoRepository:Repository<DetalleArticulosEgreso>
    ){}
  async create(createDetalleArticulosEgresoDto: CreateDetalleArticulosEgresoDto) {
    try {
          const detalleArticulosEgreso = this.detalleArticulosEgresoRepository.create({
            ...createDetalleArticulosEgresoDto
          })
          await this.detalleArticulosEgresoRepository.save(detalleArticulosEgreso);
          return {
            ok: true,
            msg: 'creado con exito'
          };
        } catch (error) {
          this.handleDBExceptions(error);
        }
  }
  async createBulk(createDetalleArticulosEgresoDto: CreateDetalleArticulosEgresoDto[]) {
    try {
          const detalleArticulosEgreso = this.detalleArticulosEgresoRepository.create(createDetalleArticulosEgresoDto);
          console.log({detalleArticulosEgreso});
          
          await this.detalleArticulosEgresoRepository.save(detalleArticulosEgreso.map(dto=>{
            const { id, ...val } = dto;
            return {
              ...val,
            }
          }));
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
    const [ lista, total ] = await this.detalleArticulosEgresoRepository.findAndCount({
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

  async findOneByIdMovimientoFinanciero(id_movimiento_financiero: number) {
    return await this.detalleArticulosEgresoRepository.find({ where: {id_movimiento_financiero: id_movimiento_financiero, flag: true } });
  }

  async findOne(id: number) {
    return await this.detalleArticulosEgresoRepository.findOneBy({ id });
  }
  async removeByIdMovFinanciero(id_movimiento_financiero: number) {
    return await this.detalleArticulosEgresoRepository.update(
      { id_movimiento_financiero: id_movimiento_financiero },
      { flag: false }
    );
  }

  async update(id: number, updateDetalleArticulosEgresoDto: UpdateDetalleArticulosEgresoDto) {
    await this.detalleArticulosEgresoRepository.update(id, updateDetalleArticulosEgresoDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.detalleArticulosEgresoRepository.update(id, {flag: false});
    return { ok: true, msg: `DetalleArticulosEgreso #${id} removed` };
  }
    private handleDBExceptions(error:any){
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error);
      throw new InternalServerErrorException('Ayuda!')
    } 
}
