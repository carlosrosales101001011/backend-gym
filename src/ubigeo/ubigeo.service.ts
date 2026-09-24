import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUbigeoDto } from './dto/create-ubigeo.dto';
import { UpdateUbigeoDto } from './dto/update-ubigeo.dto';
import { Ubigeo } from './entities/ubigeo.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class UbigeoService {
  private readonly logger = new Logger('UbigeoService')
  constructor(
    @InjectRepository(Ubigeo)
    private readonly ubigeoRepository: Repository<Ubigeo>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  async create(createUbigeoDto: CreateUbigeoDto) {
    try {
      const ubigeo = this.ubigeoRepository.create(createUbigeoDto);
      await this.ubigeoRepository.save(ubigeo);
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
    const [ lista, total ] = await this.ubigeoRepository.findAndCount({
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
  async findProv (provName:string){
    const [ lista, total ] = await this.ubigeoRepository.findAndCount({
      where: {
        flag: true,
        prov: provName
      },
      order: {
        id: 'ASC'
      }
    });
    return {
      lista: lista.map(m=>{
        return {
          value: m.id,
          label: m.distrito
        }
      }),
      total
    }
  }
  async findProvCallao (){
    const [ lista, total ] = await this.ubigeoRepository.findAndCount({
      where: {
        flag: true,
        prov: 'Callao'
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
    const ubigeo = await this.ubigeoRepository.findOne({ where: { id, flag: true } });
    if (!ubigeo) throw new BadRequestException(`Ubigeo with id ${id} not found`);
    return ubigeo;
  }

  async update(id: number, updateUbigeoDto: UpdateUbigeoDto) {
    const ubigeo = await this.ubigeoRepository.preload({
      id,
      ...updateUbigeoDto
    });
    if (!ubigeo) throw new BadRequestException(`Ubigeo with id ${id} not found`);
    try {
      await this.ubigeoRepository.save(ubigeo);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.ubigeoRepository.update(id, { flag: false });
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
      Ubigeo,
      [
        'dpto',
        'prov',
        'distrito',
        'ubigeo1',
        'ubigeo2'
      ],
      q,
      {
        take: show,
        skip: offset,
        where: {
          flag: true
        }
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
