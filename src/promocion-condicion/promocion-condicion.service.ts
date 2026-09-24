import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreatePromocionCondicionDto } from './dto/create-promocion-condicion.dto';
import { UpdatePromocionCondicionDto } from './dto/update-promocion-condicion.dto';
import { PromocionCondicion } from './entities/promocion-condicion.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Injectable()
export class PromocionCondicionService {
  private readonly logger = new Logger('PromocionCondicionService')
      constructor(
        @InjectRepository(PromocionCondicion)
        private readonly promocionesCondicionalRepository: Repository<PromocionCondicion>
      ){}

  async create(createPromocionesCondicionalDto: CreatePromocionCondicionDto) {
    try {
      const promocionesCondicional = this.promocionesCondicionalRepository.create(createPromocionesCondicionalDto)
      await this.promocionesCondicionalRepository.save(promocionesCondicional)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto = {}) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.promocionesCondicionalRepository.findAndCount({
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
    return await this.promocionesCondicionalRepository.findOne({where: {id, flag: true}});
  }

  async update(id: number, updatePromocionesCondicionalDto: UpdatePromocionCondicionDto) {
    const promocionesCondicional = await this.promocionesCondicionalRepository.preload({
      id,
      ...updatePromocionesCondicionalDto
    });
    if (!promocionesCondicional) throw new BadRequestException(`PromocionesCondicional with id ${id} not found`);
    try {
      await this.promocionesCondicionalRepository.save(promocionesCondicional);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.promocionesCondicionalRepository.update(id, {flag: false});
  }

    private handleDBExceptions(error:any){
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error);
      throw new InternalServerErrorException('Ayuda!')
    }
}
