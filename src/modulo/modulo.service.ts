import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { Repository } from 'typeorm';
import { Modulo } from './entities/modulo.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class ModuloService {
  private readonly logger = new Logger('moduloService');
  constructor(
    @InjectRepository(Modulo)
    private readonly moduloRepository: Repository<Modulo>,
    private readonly fullTextSearchService: FullTextSearchService
  ) {}
  async create(createModuloDto: CreateModuloDto) {
    try {
      const modulo = this.moduloRepository.create({
        ...createModuloDto,
      })
      await this.moduloRepository.save(modulo);
      return {
        ok: true,
        msg: 'creado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) { // Added async and paginationDto parameter
    const { show, offset } = paginationDto;
      const [ lista, total ] = await this.moduloRepository.findAndCount({
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
    const modulo = await this.moduloRepository.findOneBy({id});
    if(!modulo){
      throw new NotFoundException(`modulo with id ${id} not found`);
    }
    return modulo;
  }

  async update(id: number, updateModuloDto: UpdateModuloDto) {
    try {
      const modulo = await this.moduloRepository.preload({
        id,
        ...updateModuloDto
      })
      if(!modulo) throw new NotFoundException(`Modulo with id: ${id} not found`)
      await this.moduloRepository.save(modulo)
      return modulo;
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async remove(id: number) {
    await this.update(id, {flag: false})
    return {
      msg: `El empleado con id ${id}, se eliminó`
    };
  }
  
  async findSearch (  q: string,
    paginationDto: PaginationDto
  ){
    const { offset, show } = paginationDto;

    if (q.trim().length===0) {
      const [lista, total] = await this.moduloRepository.findAndCount({
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
        Modulo,
        [
          'label',
          'descripcion',
          'url',
          'icono'
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
