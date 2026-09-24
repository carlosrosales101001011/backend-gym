import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { Promocion } from './entities/promocion.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';

@Injectable()
export class PromocionService {
  private readonly logger = new Logger('PromocionService')
      constructor(
        @InjectRepository(Promocion)
        private readonly promocionRepository: Repository<Promocion>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getTerminologiaLabels(dto: {
    id_tipo_promocion?: number;
  }) {
    const ids = [dto.id_tipo_promocion]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Promocion> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_tipo_promocion !== undefined) labels.label_tipo_promocion = valorPorId.get(dto.id_tipo_promocion);

    return labels;
  }

  async create(createPromocionDto: CreatePromocionDto) {
    try {
      const labels = await this.getTerminologiaLabels(createPromocionDto);
      const promocion = this.promocionRepository.create({
        ...createPromocionDto,
        ...labels
      })
      await this.promocionRepository.save(promocion)
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
    const [ lista, total ] = await this.promocionRepository.findAndCount({
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
    return await this.promocionRepository.findOne({where: {id, flag: true}, select: {
      id: true,
      codigo: true,
      nombre: true,
      descripcion: true,
      observacion: true,
      fecha_fin: true,
      fecha_inicio: true,
      hora_fin: true,
      hora_inicio: true,
      id_tipo_promocion: true,
      label_tipo_promocion: false,
      is_acumulable: true,
      is_activo: true,
      monto_maximo: true,
      monto_minimo: true,
      cantidad_max_uso: true,
      cantidad_usos: true,
      prioridad: true
    }});
  }

  async update(id: number, updatePromocionDto: UpdatePromocionDto) {
    const labels = await this.getTerminologiaLabels(updatePromocionDto);
    const promocion = await this.promocionRepository.preload({
      id,
      ...updatePromocionDto,
      ...labels
    });
    if (!promocion) throw new BadRequestException(`Promocion with id ${id} not found`);
    try {
      await this.promocionRepository.save(promocion);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.promocionRepository.update(id, {flag: false});
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
        Promocion,
        [
          'codigo',
          'nombre',
          'descripcion',
          'observacion',
          'label_tipo_promocion'
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
