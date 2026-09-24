import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { Empresa } from './entities/empresa.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Injectable()
export class EmpresaService {
  private readonly logger = new Logger('EmpresaService')
      constructor(
        @InjectRepository(Empresa)
        private readonly empresaRepository: Repository<Empresa>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getTerminologiaLabels(dto: {
    id_tipo_empresa?: number;
    id_estado?: number;
    id_actividad_economica?: number;
    id_departamento?: number;
    id_provincia?: number;
    id_distrito?: number;
    id_moneda_principal?: number;
  }) {
    const ids = [
      dto.id_tipo_empresa,
      dto.id_estado,
      dto.id_actividad_economica,
      dto.id_departamento,
      dto.id_provincia,
      dto.id_distrito,
      dto.id_moneda_principal
    ].filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Empresa> = {};
    if (ids.length === 0) return labels;

    const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
    const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

    if (dto.id_tipo_empresa !== undefined) labels.label_tipo_empresa = valorPorId.get(dto.id_tipo_empresa);
    if (dto.id_estado !== undefined) labels.label_estado = valorPorId.get(dto.id_estado);
    if (dto.id_actividad_economica !== undefined) labels.label_actividad_economica = valorPorId.get(dto.id_actividad_economica);
    if (dto.id_departamento !== undefined) labels.label_departamento = valorPorId.get(dto.id_departamento);
    if (dto.id_provincia !== undefined) labels.label_provincia = valorPorId.get(dto.id_provincia);
    if (dto.id_distrito !== undefined) labels.label_distrito = valorPorId.get(dto.id_distrito);
    if (dto.id_moneda_principal !== undefined) labels.label_moneda_principal = valorPorId.get(dto.id_moneda_principal);

    return labels;
  }

  async create(createEmpresaDto: CreateEmpresaDto) {
    try {
      const labels = await this.getTerminologiaLabels(createEmpresaDto);
      const empresa = this.empresaRepository.create({
        ...createEmpresaDto,
        ...labels
      })
      await this.empresaRepository.save(empresa)
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
    const [ lista, total ] = await this.empresaRepository.findAndCount({
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
    return await this.empresaRepository.findOne({where: {id, flag: true}});
  }

  async update(id: number, updateEmpresaDto: UpdateEmpresaDto) {
    const labels = await this.getTerminologiaLabels(updateEmpresaDto);
    const empresa = await this.empresaRepository.preload({
      id,
      ...updateEmpresaDto,
      ...labels
    });
    if (!empresa) throw new BadRequestException(`Empresa with id ${id} not found`);
    try {
      await this.empresaRepository.save(empresa);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.empresaRepository.update(id, {flag: false});
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
        Empresa,
        [
          'razon_social',
          'nombre_comercial',
          'ruc',
          'correo_corporativo',
          'direccion_fiscal',
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
