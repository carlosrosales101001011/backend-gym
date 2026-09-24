import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDetallepagoGastoDto } from './dto/create-detallepago-gasto.dto';
import { UpdateDetallepagoGastoDto } from './dto/update-detallepago-gasto.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DetallepagoGasto } from './entities/detallepago-gasto.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class DetallepagoGastoService {
  private readonly logger = new Logger('detallepagoGastoService')
  constructor(
    @InjectRepository(DetallepagoGasto)
    private readonly detallepagoGastoRepository:Repository<DetallepagoGasto>
  ){}
  async create(createDetallepagoGastoDto: CreateDetallepagoGastoDto) {
    try {
        const detallepagoGasto = this.detallepagoGastoRepository.create({
          ...createDetallepagoGastoDto
        })
        await this.detallepagoGastoRepository.save(detallepagoGasto);
        return {
          ok: true,
          msg: 'creado con exito'
        };
      } catch (error) {
        this.handleDBExceptions(error);
      }
  }
  async findOneByIdMovimientoFinanciero(id_movimiento_financiero: number) {
    return await this.detallepagoGastoRepository.find({ where: {id_movimiento_financiero: id_movimiento_financiero, flag: true } });;
  }
  async createBulk(createDetallepagoGastoDtos: CreateDetallepagoGastoDto[]) {
    try {
        const detallepagoGastos = this.detallepagoGastoRepository.create(createDetallepagoGastoDtos);
        console.log({detallepagoGastos});
        
        await this.detallepagoGastoRepository.save(detallepagoGastos.map(m=>{
          const { id, ...val } = m;
          return {
            ...val,
          }
        }));
        return {
          ok: true,
          msg: 'creados con exito'
        };
      } catch (error) {
        this.handleDBExceptions(error);
      }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.detallepagoGastoRepository.findAndCount({
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
    const detallepagoGasto = await this.detallepagoGastoRepository.findOneBy({id});
    if(!detallepagoGasto){
      throw new NotFoundException(`detallepagoGasto with id ${id} not found`);
    }
    return detallepagoGasto;
  }

  async update(id: number, updateDetallepagoGastoDto: UpdateDetallepagoGastoDto) {
    try {
      const detallepagoGasto = await this.detallepagoGastoRepository.preload({
        id,
        ...updateDetallepagoGastoDto
      })
      if(!detallepagoGasto) throw new NotFoundException(`detallepagoGasto with id: ${id} not found`)
      await this.detallepagoGastoRepository.save(detallepagoGasto)
      return detallepagoGasto;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async removeByIdMovFinanciero(id_movimiento_financiero: number) {
    return await this.detallepagoGastoRepository.update(
      { id_movimiento_financiero: id_movimiento_financiero },
      { flag: false }
    );
  }
  remove(id: number) {
    return this.detallepagoGastoRepository.update(id, {flag: false});
  }
  
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  } 
}
