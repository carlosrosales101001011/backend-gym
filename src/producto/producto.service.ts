import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { Producto } from './entities/producto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { EmpresaAlmacen } from 'src/empresa-almacen/entities/empresa-almacen.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { ProductoMovimientoService } from 'src/producto-movimiento/producto-movimiento.service';

const ID_TIPO_MOVIMIENTO_INGRESO_INICIAL = 6045;
const ID_MOTIVO_INGRESO_INICIAL = 6047;

@Injectable()
export class ProductoService {
  private readonly logger = new Logger('ProductoService')
      constructor(
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        @InjectRepository(EmpresaSucursal)
        private readonly empresaSucursalRepository: Repository<EmpresaSucursal>,
        @InjectRepository(EmpresaAlmacen)
        private readonly empresaAlmacenRepository: Repository<EmpresaAlmacen>,
        private readonly fullTextSearchService: FullTextSearchService,
        private readonly productoMovimientoService: ProductoMovimientoService
      ){}

  private async getTerminologiaLabels(dto: {
    id_categoria?: number;
    id_marca?: number;
    id_unidadMedida?: number;
    id_estado?: number;
    id_sucursal?: number;
    id_almacen?: number;
  }) {
    const ids = [dto.id_categoria, dto.id_marca, dto.id_unidadMedida, dto.id_estado]
      .filter((id): id is number => id !== undefined && id !== null);

    const labels: Partial<Producto> = {};

    if (ids.length > 0) {
      const terminologias = await this.terminologiaRepository.findBy({ id: In(ids) });
      const valorPorId = new Map(terminologias.map(t => [t.id, t.valor]));

      if (dto.id_categoria !== undefined) labels.label_categoria = valorPorId.get(dto.id_categoria);
      if (dto.id_marca !== undefined) labels.label_marca = valorPorId.get(dto.id_marca);
      if (dto.id_unidadMedida !== undefined) labels.label_unidadMedida = valorPorId.get(dto.id_unidadMedida);
      if (dto.id_estado !== undefined) labels.label_estado = valorPorId.get(dto.id_estado);
    }

    if (dto.id_sucursal !== undefined && dto.id_sucursal !== null) {
      const sucursal = await this.empresaSucursalRepository.findOneBy({ id: dto.id_sucursal });
      labels.label_sucursal = sucursal?.nombre;
    }

    if (dto.id_almacen !== undefined && dto.id_almacen !== null) {
      const almacen = await this.empresaAlmacenRepository.findOneBy({ id: dto.id_almacen });
      labels.label_almacen = almacen?.nombre;
    }

    return labels;
  }

  async create(createProductoDto: CreateProductoDto) {
    try {
      const labels = await this.getTerminologiaLabels(createProductoDto);
      const producto = this.productoRepository.create({
        ...createProductoDto,
        stock_inicial: createProductoDto.stock_actual,
        stock_actual: 0,
        ...labels
      })
      await this.productoRepository.save(producto)

      await this.productoMovimientoService.create({
        id_producto: producto.id,
        id_tipo_movimiento: ID_TIPO_MOVIMIENTO_INGRESO_INICIAL,
        id_motivo: ID_MOTIVO_INGRESO_INICIAL,
        id_sucursal_origen: producto.id_sucursal,
        id_almacen_origen: producto.id_almacen,
        id_sucursal_destino: producto.id_sucursal,
        id_almacen_destino: producto.id_almacen,
        cantidad_movimiento: producto.stock_inicial
      });

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
    const [ lista, total ] = await this.productoRepository.findAndCount({
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
    return await this.productoRepository.findOne({where: {id, flag: true}, select: {
      id: true,
      nombre: true,
      codigo_barra: true,
      codigo_sku: true,
      descripcion: true,
      // stock_actual: true,
      // stock_inicial: true,
      stock_max: true,
      stock_min: true,
      id_categoria: true,
      label_categoria: false,
      id_marca: true,
      label_marca: false,
      id_unidadMedida: true,
      label_unidadMedida: false,
      id_estado: true,
      label_estado: false,
      id_sucursal: true,
      id_almacen: true,
      label_almacen: false,
      label_sucursal: false
    }});
  }

  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const labels = await this.getTerminologiaLabels(updateProductoDto);
    const producto = await this.productoRepository.preload({
      id,
      ...updateProductoDto,
      ...labels
    });
    if (!producto) throw new BadRequestException(`Producto with id ${id} not found`);
    try {
      await this.productoRepository.save(producto);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.productoRepository.update(id, {flag: false});
  }

    async findSearch (  q: string,
      paginationDto: PaginationDto
  ){
    const { offset, show } = paginationDto;

    if (q.trim().length===0) {
      console.log('abcde');
      const { lista, total } = await this.findAll(paginationDto);
      return {
        items: lista,
        total
      };
    }
    const {items, total} =await this.fullTextSearchService.search(
        Producto,
        [
          'nombre',
          'codigo_barra',
          'codigo_sku',
          'descripcion',
          'label_categoria',
          'label_marca',
          'label_unidadMedida'
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
