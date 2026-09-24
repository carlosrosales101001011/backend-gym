import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePromocionBeneficioDto } from './dto/create-promocion-beneficio.dto';
import { UpdatePromocionBeneficioDto } from './dto/update-promocion-beneficio.dto';
import { PromocionBeneficio } from './entities/promocion-beneficio.entity';
import { Promocion } from 'src/promocion/entities/promocion.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class PromocionBeneficioService {
  private readonly logger = new Logger('PromocionBeneficioService')
      constructor(
        @InjectRepository(PromocionBeneficio)
        private readonly promocionBeneficioRepository: Repository<PromocionBeneficio>,
        @InjectRepository(Promocion)
        private readonly promocionRepository: Repository<Promocion>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_promocion?: number;
    id_producto?: number;
    id_categoria?: number;
    id_tipo_beneficio?: number;
  }) {
    const labels: Partial<PromocionBeneficio> = {};

    if (dto.id_promocion !== undefined) {
      const promocion = await this.promocionRepository.findOneBy({ id: dto.id_promocion });
      labels.label_promocion = promocion?.nombre;
    }

    if (dto.id_producto !== undefined) {
      const producto = await this.productoRepository.findOneBy({ id: dto.id_producto });
      labels.label_producto = producto?.nombre;
    }

    const terminologiaIds = [dto.id_categoria, dto.id_tipo_beneficio]
      .filter((id): id is number => id !== undefined && id !== null);

    if (terminologiaIds.length > 0) {
      const terminologias = await this.terminologiaRepository.findBy({ id: In(terminologiaIds) });
      const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

      if (dto.id_categoria !== undefined) labels.label_categoria = valorPorId.get(dto.id_categoria);
      if (dto.id_tipo_beneficio !== undefined) labels.label_tipo_beneficio = valorPorId.get(dto.id_tipo_beneficio);
    }

    return labels;
  }

  async create(createPromocionBeneficioDto: CreatePromocionBeneficioDto) {
    try {
      const labels = await this.getLabels(createPromocionBeneficioDto);
      const promocionBeneficio = this.promocionBeneficioRepository.create({
        ...createPromocionBeneficioDto,
        ...labels
      })
      await this.promocionBeneficioRepository.save(promocionBeneficio)
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
    const [ lista, total ] = await this.promocionBeneficioRepository.findAndCount({
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
    return await this.promocionBeneficioRepository.findOne({where: {id, flag: true}, select: {id: true, id_promocion: true, label_promocion: false, id_tipo_beneficio: true, label_tipo_beneficio: false, id_producto: true, label_producto: false, id_categoria: true, label_categoria: false, cantidad: true, porcentaje_descuento: true, monto_descuento: true, precio_especial: true, aplica_sobre: true}});
  }

  async update(id: number, updatePromocionBeneficioDto: UpdatePromocionBeneficioDto) {
    const labels = await this.getLabels(updatePromocionBeneficioDto);
    const promocionBeneficio = await this.promocionBeneficioRepository.preload({
      id,
      ...updatePromocionBeneficioDto,
      ...labels
    });
    if (!promocionBeneficio) throw new BadRequestException(`PromocionBeneficio with id ${id} not found`);
    try {
      await this.promocionBeneficioRepository.save(promocionBeneficio);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.promocionBeneficioRepository.update(id, {flag: false});
  }

    async findSearch (  q: string,
      paginationDto: PaginationDto
  ){
    const { offset, show } = paginationDto;

    if (q.trim().length===0) {
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      }
    }
    const {items, total} =await this.fullTextSearchService.search(
        PromocionBeneficio,
        [
          'label_promocion',
          'label_producto',
          'label_categoria',
          'label_tipo_beneficio'
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
