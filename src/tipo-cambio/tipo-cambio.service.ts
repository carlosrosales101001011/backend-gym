import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateTipoCambioDto } from './dto/create-tipo-cambio.dto';
import { UpdateTipoCambioDto } from './dto/update-tipo-cambio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { TipoCambio } from './entities/tipo-cambio.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class TipoCambioService {
  private readonly logger = new Logger('TipoCambioService');
  constructor(
    @InjectRepository(TipoCambio)
    private readonly tipoCambioRepository: Repository<TipoCambio>,
    @InjectRepository(Terminologia)
    private readonly terminologiaRepository: Repository<Terminologia>,
    private readonly fullTextSearchService: FullTextSearchService
  ){}

  private async getTerminologiaLabels(dto: {
    id_codigo_monedaOrigen?: number;
    id_codigo_monedaDestino?: number;
  }) {
    const ids = [dto.id_codigo_monedaOrigen, dto.id_codigo_monedaDestino]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<TipoCambio> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_codigo_monedaOrigen !== undefined) labels.label_codigo_monedaOrigen = valorPorId.get(dto.id_codigo_monedaOrigen);
    if (dto.id_codigo_monedaDestino !== undefined) labels.label_codigo_monedaDestino = valorPorId.get(dto.id_codigo_monedaDestino);

    return labels;
  }

  async create(createTipoCambioDto: CreateTipoCambioDto) {
    try {
        const labels = await this.getTerminologiaLabels(createTipoCambioDto);
        const tipoCambio = this.tipoCambioRepository.create({
          ...createTipoCambioDto,
          ...labels
        });
        await this.tipoCambioRepository.save(tipoCambio);
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
    const [ lista, total ] = await this.tipoCambioRepository.findAndCount({
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

  async findSearch (  q: string,
    paginationDto: PaginationDto
){
  const { offset, show } = paginationDto;

  if (q.trim().length===0) {
    const [lista, total] = await this.tipoCambioRepository.findAndCount({
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
      TipoCambio,
      [
        'label_codigo_monedaOrigen',
        'label_codigo_monedaDestino',
        'venta',
        'compra',
        'fecha'
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

  async findOne(id: number) {
    try {
      const tipoCambio = await this.tipoCambioRepository.findOne({where: {id, flag: true}, select: {id_codigo_monedaOrigen: true, id_codigo_monedaDestino: true, venta: true, compra: true, fecha: true, id: true}});
      return tipoCambio;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async update(id: number, updateTipoCambioDto: UpdateTipoCambioDto) {
    try {
      const labels = await this.getTerminologiaLabels(updateTipoCambioDto);
      const tipoCambio = await this.tipoCambioRepository.preload({
        id: id,
        ...updateTipoCambioDto,
        ...labels
      });
      if (!tipoCambio) {
        throw new BadRequestException(`TipoCambio with id ${id} not found`);
      }
      await this.tipoCambioRepository.save(tipoCambio);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: number) {
    try {
      const tipoCambio = await this.tipoCambioRepository.findOne({where: {id, flag: true}});
      if (!tipoCambio) {
        throw new BadRequestException(`TipoCambio with id ${id} not found`);
      }
      tipoCambio.flag = false;
      await this.tipoCambioRepository.save(tipoCambio);
      return {
        ok: true,
        msg: 'eliminado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
  
    private handleDBExceptions(error:any){
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error);
      throw new InternalServerErrorException('Ayuda!')
    } 
}
