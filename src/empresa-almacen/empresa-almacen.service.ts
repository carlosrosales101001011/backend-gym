import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateEmpresaAlmacenDto } from './dto/create-empresa-almacen.dto';
import { UpdateEmpresaAlmacenDto } from './dto/update-empresa-almacen.dto';
import { EmpresaAlmacen } from './entities/empresa-almacen.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { ProductoMovimiento } from 'src/producto-movimiento/entities/producto-movimiento.entity';

@Injectable()
export class EmpresaAlmacenService {
  private readonly logger = new Logger('EmpresaAlmacenService')
      constructor(
        @InjectRepository(EmpresaAlmacen)
        private readonly empresaAlmacenRepository: Repository<EmpresaAlmacen>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        @InjectRepository(EmpresaSucursal)
        private readonly empresaSucursalRepository: Repository<EmpresaSucursal>,
        @InjectRepository(ProductoMovimiento)
        private readonly productoMovimientoRepository: Repository<ProductoMovimiento>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_sucursal?: number;
    id_tipo?: number;
    id_estado?: number;
  }) {
    const labels: Partial<EmpresaAlmacen> = {};

    const terminologiaIds = [dto.id_tipo, dto.id_estado]
      .filter((id): id is number => id !== undefined && id !== null);

    if (terminologiaIds.length) {
      const terminologias = await this.terminologiaRepository.findBy({ id: In(terminologiaIds) });
      const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));
      if (dto.id_tipo !== undefined) labels.label_tipo = valorPorId.get(dto.id_tipo);
      if (dto.id_estado !== undefined) labels.label_estado = valorPorId.get(dto.id_estado);
    }

    if (dto.id_sucursal !== undefined) {
      const sucursal = await this.empresaSucursalRepository.findOne({ where: { id: dto.id_sucursal } });
      console.log({ls: labels.label_sucursal, sn: sucursal?.nombre});
      
      labels.label_sucursal = sucursal?.nombre;
    }

    return labels;
  }

  async create(createEmpresaAlmacenDto: CreateEmpresaAlmacenDto) {
    try {
      const labels = await this.getLabels(createEmpresaAlmacenDto);
      const empresaAlmacen = this.empresaAlmacenRepository.create({
        ...createEmpresaAlmacenDto,
        ...labels
      })
      await this.empresaAlmacenRepository.save(empresaAlmacen)
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
    const [ lista, total ] = await this.empresaAlmacenRepository.findAndCount({
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
    return await this.empresaAlmacenRepository.findOne({where: {id, flag: true}, select: {label_estado: false, label_tipo: false, label_sucursal: false, capacidad: true, codigo: true, direccion: true, id: true, id_estado: true, id_responsable: true, id_sucursal: true, id_tipo: true, nombre: true}});
  }

  async update(id: number, updateEmpresaAlmacenDto: UpdateEmpresaAlmacenDto) {
    const labels = await this.getLabels(updateEmpresaAlmacenDto);
    const empresaAlmacen = await this.empresaAlmacenRepository.preload({
      id,
      ...updateEmpresaAlmacenDto,
      ...labels
    });
    if (!empresaAlmacen) throw new BadRequestException(`EmpresaAlmacen with id ${id} not found`);
    try {
      await this.empresaAlmacenRepository.save(empresaAlmacen);
      if (empresaAlmacen.nombre) {
        await this.productoMovimientoRepository.update(
          { id_almacen_origen: id },
          { label_almacen_origen: empresaAlmacen.nombre }
        );
        await this.productoMovimientoRepository.update(
          { id_almacen_destino: id },
          { label_almacen_destino: empresaAlmacen.nombre }
        );
      }
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.empresaAlmacenRepository.update(id, {flag: false});
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
        EmpresaAlmacen,
        [
          'codigo',
          'nombre',
          'direccion',
          'label_sucursal'
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
