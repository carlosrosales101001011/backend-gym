import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateProductoMovimientoDto } from './dto/create-producto-movimiento.dto';
import { UpdateProductoMovimientoDto } from './dto/update-producto-movimiento.dto';
import { ProductoMovimiento } from './entities/producto-movimiento.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { EmpresaAlmacen } from 'src/empresa-almacen/entities/empresa-almacen.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

const ID_TIPO_MOVIMIENTO_INGRESO = 6045;
const ID_TIPO_MOVIMIENTO_SALIDA = 6046;

@Injectable()
export class ProductoMovimientoService {
  private readonly logger = new Logger('ProductoMovimientoService')
      constructor(
        @InjectRepository(ProductoMovimiento)
        private readonly productoMovimientoRepository: Repository<ProductoMovimiento>,
        @InjectRepository(Producto)
        private readonly productoRepository: Repository<Producto>,
        @InjectRepository(Terminologia)
        private readonly terminologiaRepository: Repository<Terminologia>,
        @InjectRepository(EmpresaSucursal)
        private readonly empresaSucursalRepository: Repository<EmpresaSucursal>,
        @InjectRepository(EmpresaAlmacen)
        private readonly empresaAlmacenRepository: Repository<EmpresaAlmacen>,
        private readonly fullTextSearchService: FullTextSearchService
      ){}

  private async getLabels(dto: {
    id_producto?: number;
    id_sucursal_origen?: number;
    id_almacen_origen?: number;
    id_sucursal_destino?: number;
    id_almacen_destino?: number;
    id_motivo?: number;
    id_tipo_movimiento?:number;
  }) {
    const labels: Partial<ProductoMovimiento> = {};

    if (dto.id_producto !== undefined) {
      const producto = await this.productoRepository.findOneBy({ id: dto.id_producto });
      labels.label_producto = producto?.nombre;
      labels.label_marca_producto = producto?.label_marca;
    }

    if (dto.id_motivo !== undefined) {
      const motivo = await this.terminologiaRepository.findOneBy({ id: dto.id_motivo });
      labels.label_motivo = motivo?.valor;
    }
    if (dto.id_tipo_movimiento !== undefined) {
      const motivo = await this.terminologiaRepository.findOneBy({ id: dto.id_tipo_movimiento });
      labels.label_tipo_movimiento = motivo?.valor;
    }

    const sucursalIds = [dto.id_sucursal_origen, dto.id_sucursal_destino]
      .filter((id): id is number => id !== undefined && id !== null);

    if (sucursalIds.length > 0) {
      const sucursales = await this.empresaSucursalRepository.findBy({ id: In(sucursalIds) });
      const nombrePorId = new Map(sucursales.map(s => [s.id, s.nombre]));
      if (dto.id_sucursal_origen !== undefined) labels.label_sucursal_origen = nombrePorId.get(dto.id_sucursal_origen);
      if (dto.id_sucursal_destino !== undefined) labels.label_sucursal_destino = nombrePorId.get(dto.id_sucursal_destino);
    }

    const almacenIds = [dto.id_almacen_origen, dto.id_almacen_destino]
      .filter((id): id is number => id !== undefined && id !== null);

    if (almacenIds.length > 0) {
      const almacenes = await this.empresaAlmacenRepository.findBy({ id: In(almacenIds) });
      const nombrePorId = new Map(almacenes.map(a => [a.id, a.nombre]));
      if (dto.id_almacen_origen !== undefined) labels.label_almacen_origen = nombrePorId.get(dto.id_almacen_origen);
      if (dto.id_almacen_destino !== undefined) labels.label_almacen_destino = nombrePorId.get(dto.id_almacen_destino);
    }

    return labels;
  }

  async create(createProductoMovimientoDto: CreateProductoMovimientoDto) {
    try {
      const labels = await this.getLabels(createProductoMovimientoDto);
      const productoMovimiento = this.productoMovimientoRepository.create({
        ...createProductoMovimientoDto,
        ...labels
      })
      await this.productoMovimientoRepository.save(productoMovimiento)

      const { id_producto, id_tipo_movimiento, cantidad_movimiento } = createProductoMovimientoDto;
      if (id_producto !== undefined && cantidad_movimiento) {
        if (id_tipo_movimiento === ID_TIPO_MOVIMIENTO_INGRESO) {
          await this.productoRepository.increment({ id: id_producto }, 'stock_actual', cantidad_movimiento);
        } else if (id_tipo_movimiento === ID_TIPO_MOVIMIENTO_SALIDA) {
          await this.productoRepository.decrement({ id: id_producto }, 'stock_actual', cantidad_movimiento);
        }
      }
      console.log({productoMovimiento});
      
      return {
        ok: true,
        msg: 'creado con exito'
      };
    }catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto = {}, id_tipo_mov:number) {
    const { show, offset } = paginationDto;
    if (id_tipo_mov===0) {
    const [ lista, total ] = await this.productoMovimientoRepository.findAndCount({
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
    const [ lista, total ] = await this.productoMovimientoRepository.findAndCount({
      take: show,
      skip: offset,
      where: {
        flag: true,
        id_tipo_movimiento: id_tipo_mov
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
    return await this.productoMovimientoRepository.findOne({where: {id, flag: true}, select: {
      id: true,
      id_producto: true,
      label_producto: false,
      id_sucursal_origen: true,
      label_sucursal_origen: false,
      id_almacen_origen: true,
      label_almacen_origen: false,
      id_sucursal_destino: true,
      label_sucursal_destino: false,
      id_almacen_destino: true,
      label_almacen_destino: false,
      id_motivo: true,
      label_motivo: false,
      cantidad_movimiento: true,
      id_tipo_movimiento: true,
      label_tipo_movimiento: false,
      label_marca_producto: false
    }});
  }

  async update(id: number, updateProductoMovimientoDto: UpdateProductoMovimientoDto) {
    const labels = await this.getLabels(updateProductoMovimientoDto);
    const productoMovimiento = await this.productoMovimientoRepository.preload({
      id,
      ...updateProductoMovimientoDto,
      ...labels
    });
    if (!productoMovimiento) throw new BadRequestException(`ProductoMovimiento with id ${id} not found`);
    try {
      await this.productoMovimientoRepository.save(productoMovimiento);
      return {
        ok: true,
        msg: 'actualizado con exito'
      };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  remove(id: number) {
    return this.productoMovimientoRepository.update(id, { flag: false });
  }

    async findSearch (  q: string,
      paginationDto: PaginationDto,
      id_tipo_mov: number
  ){
    const { offset, show } = paginationDto;
    if (id_tipo_mov===0) {
      
    if (q.trim().length===0) {
      const { lista, total } = await this.findAll(paginationDto, id_tipo_mov);
      return {
        items: lista,
        total
      }
    }
    const {items, total} =await this.fullTextSearchService.search(
        ProductoMovimiento,
        [
          'label_producto',
          'label_marca_producto',
          'label_sucursal_origen',
          'label_sucursal_destino',
          'label_almacen_origen',
          'label_almacen_destino',
          'label_motivo'
        ],
        q,
        {
          take: show,
          skip: offset,
          where: {flag: true}
        },

      );
      return {
        items,
        total
      }
    }
    if (q.trim().length===0) {
      const { lista, total } = await this.findAll(paginationDto, id_tipo_mov);
      return {
        items: lista,
        total
      }
    }
    const {items, total} =await this.fullTextSearchService.search(
        ProductoMovimiento,
        [
          'label_producto',
          'label_marca_producto',
          'label_sucursal_origen',
          'label_sucursal_destino',
          'label_almacen_origen',
          'label_almacen_destino',
          'label_motivo'
        ],
        q,
        {
          take: show,
          skip: offset,
          where: {flag: true, id_tipo_movimiento: id_tipo_mov}
        },

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
