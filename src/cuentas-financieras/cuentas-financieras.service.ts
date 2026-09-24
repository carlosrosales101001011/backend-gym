import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateCuentasFinancieraDto } from './dto/create-cuentas-financiera.dto';
import { UpdateCuentasFinancieraDto } from './dto/update-cuentas-financiera.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CuentasFinanciera } from './entities/cuentas-financiera.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class CuentasFinancierasService {
  private readonly logger = new Logger('CuentasFinancierasService')
    constructor(
      @InjectRepository(CuentasFinanciera)
      private readonly cuentasFinancieraRepository:Repository<CuentasFinanciera>,
      @InjectRepository(Terminologia)
      private readonly terminologiaRepository: Repository<Terminologia>,
      private readonly fullTextSearchService: FullTextSearchService
    ){}

  private async getTerminologiaLabels(dto: {
    id_codigo_moneda?: number;
    id_banco?: number;
    id_tipo_cuenta?: number;
  }) {
    const ids = [dto.id_codigo_moneda, dto.id_banco, dto.id_tipo_cuenta]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<CuentasFinanciera> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_codigo_moneda !== undefined) labels.label_codigo_moneda = valorPorId.get(dto.id_codigo_moneda);
    if (dto.id_banco !== undefined) labels.label_banco = valorPorId.get(dto.id_banco);
    if (dto.id_tipo_cuenta !== undefined) labels.label_tipo_cuenta = valorPorId.get(dto.id_tipo_cuenta);

    return labels;
  }

  async create(createCuentasFinancieraDto: CreateCuentasFinancieraDto) {
    try {
      const labels = await this.getTerminologiaLabels(createCuentasFinancieraDto);
      const cuentasFinanciera = this.cuentasFinancieraRepository.create({
        saldo_actual: createCuentasFinancieraDto.saldo_inicial,
        ...createCuentasFinancieraDto,
        ...labels
      })
      await this.cuentasFinancieraRepository.save(cuentasFinanciera)
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
    const [ lista, total ] = await this.cuentasFinancieraRepository.findAndCount({
          take: show,
          skip: offset,
          select: {
            cci: true,
            descripcion: true,
            estado: true,
            id: true,
            id_banco: true,
            id_codigo_moneda: true,
            id_tipo_cuenta: true,
            n_cuenta: true,
            saldo_actual: true,
            saldo_inicial: true,
            titular: true,
          },
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
    const [lista, total] = await this.cuentasFinancieraRepository.findAndCount({
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
      CuentasFinanciera,
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

  async findOne(id: number) {
    return await this.cuentasFinancieraRepository.findOne({where: {id, flag: true}, select: {n_cuenta: true, cci: true, titular: true, saldo_inicial: true, saldo_actual: true, estado: true, descripcion: true, id_tipo_cuenta: true, id_codigo_moneda: true, id_banco: true, id: true}});
  }

  async update(id: number, updateCuentasFinancieraDto: UpdateCuentasFinancieraDto) {
    try {
          const labels = await this.getTerminologiaLabels(updateCuentasFinancieraDto);
          const cuentasFinanciera = await this.cuentasFinancieraRepository.preload({
            id,
            ...updateCuentasFinancieraDto,
            ...labels
          })
          if(!cuentasFinanciera) throw new NotFoundException(`CuentasFinanciera with id: ${id} not found`)
          await this.cuentasFinancieraRepository.save(cuentasFinanciera)
          return cuentasFinanciera;
        } catch (error) {
          this.handleDBExceptions(error)
        }
  }

  async remove(id: number) {
    await this.cuentasFinancieraRepository.update(id, {flag: false});
    return {
      ok: true,
      msg: `cuentasFinanciera #${id} eliminado con exito`
    };
  }
  
    private handleDBExceptions(error:any){
      if(error.code === '23505')
        throw new BadRequestException(error.detail);
      this.logger.error(error);
      throw new InternalServerErrorException('Ayuda!')
    } 
}
