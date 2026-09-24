import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateImpuestoDto } from './dto/create-impuesto.dto';
import { UpdateImpuestoDto } from './dto/update-impuesto.dto';
import { Impuesto } from './entities/impuesto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class ImpuestoService {
  private readonly logger = new Logger('ImpuestoService')
      constructor(
        @InjectRepository(Impuesto)
        private readonly impuestoRepository: Repository<Impuesto>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getTerminologiaLabels(dto: {
    id_tipo?: number;
    id_aplica_sobre?: number;
    id_base_calculo?: number;
  }) {
    const ids = [dto.id_tipo, dto.id_aplica_sobre, dto.id_base_calculo]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Impuesto> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_tipo !== undefined) labels.label_tipo = valorPorId.get(dto.id_tipo);
    if (dto.id_aplica_sobre !== undefined) labels.label_aplica_sobre = valorPorId.get(dto.id_aplica_sobre);
    if (dto.id_base_calculo !== undefined) labels.label_base_calculo = valorPorId.get(dto.id_base_calculo);

    return labels;
  }

  async create(createImpuestoDto: CreateImpuestoDto) {
    try {
      const labels = await this.getTerminologiaLabels(createImpuestoDto);
      const impuesto = this.impuestoRepository.create({
        ...createImpuestoDto,
        ...labels
      })
      await this.impuestoRepository.save(impuesto)
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { show, offset } = paginationDto;
    const [ lista, total ] = await this.impuestoRepository.findAndCount({
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
    return await this.impuestoRepository.findOne({where: {id, flag: true}, select: {codigo: true, nombre: true, descripcion: true, porcentaje: true, monto: true, id_tipo: true, label_tipo: false, id_aplica_sobre: true, label_aplica_sobre: false, id_base_calculo: true, label_base_calculo: false, id: true}});
  }

  async update(id: number, updateImpuestoDto: UpdateImpuestoDto) {
    const labels = await this.getTerminologiaLabels(updateImpuestoDto);
    const impuesto = await this.impuestoRepository.preload({
      id,
      ...updateImpuestoDto,
      ...labels
    });
    if (!impuesto) throw new BadRequestException(`Impuesto with id ${id} not found`);
    try {
      await this.impuestoRepository.save(impuesto);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.impuestoRepository.update(id, {flag: false});
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
        Impuesto,
        [
          'label_codigo_moneda',
          'label_banco',
          'n_cuenta',
          'cci',
          'titular',
          'descripcion'
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
