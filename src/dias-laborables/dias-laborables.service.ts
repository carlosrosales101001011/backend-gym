import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateDiasLaborableDto } from './dto/create-dias-laborable.dto';
import { UpdateDiasLaborableDto } from './dto/update-dias-laborable.dto';
import { DiasLaborable } from './entities/dias-laborable.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uidv4 } from 'uuid'
@Injectable()
export class DiasLaborablesService {
  private readonly logger = new Logger('diasLaborablesService')
  constructor(
    @InjectRepository(DiasLaborable)
    private readonly diasLaborableRepository: Repository<DiasLaborable>
  ) {}
  async create(createDiasLaborableDto: CreateDiasLaborableDto) {
    try {
        const diasLaborable = this.diasLaborableRepository.create({
          ...createDiasLaborableDto,
        })
        await this.diasLaborableRepository.save(diasLaborable);
        return {
          ok: true,
          msg: 'creado con exito'
        };
      } catch (error) {
        this.handleDBExceptions(error);
      }
  }

  async findAllxIDContrato( id_contrato: number) {
    try {
      const diasLaborables = await this.diasLaborableRepository.find({cache: true, where: {id_contrato}});
      return diasLaborables;
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findOne(id: number) {
    const diaLaborable= await this.diasLaborableRepository.findOneBy({id});
      if (diaLaborable) {
        throw new NotFoundException(`diasLaborables whith termino ${id} not found`)
      }
    return diaLaborable;
  }

  async update(id: number, updateDiasLaborableDto: UpdateDiasLaborableDto) {
    try {
      const diasLaborable = await this.diasLaborableRepository.preload({id, ...updateDiasLaborableDto});
      if(!diasLaborable){
        throw new BadRequestException(`diasLaborable whith id ${id} not found`)
      }
      await this.diasLaborableRepository.save({...diasLaborable});
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    const diasLaborable = await this.diasLaborableRepository.findOneBy({id});
    if(!diasLaborable){
      throw new BadRequestException(`diasLaborable whith id ${id} not found`)
    }
    await this.diasLaborableRepository.remove(diasLaborable);
  }
  private handleDBExceptions(error:any){
    if(error.code === '23505')
      throw new BadRequestException(error.detail);
    this.logger.error(error);
    throw new InternalServerErrorException('Ayuda!')
  } 
}
