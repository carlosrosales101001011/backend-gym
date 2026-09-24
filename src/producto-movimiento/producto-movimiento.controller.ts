import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ProductoMovimientoService } from './producto-movimiento.service';
import { CreateProductoMovimientoDto } from './dto/create-producto-movimiento.dto';
import { UpdateProductoMovimientoDto } from './dto/update-producto-movimiento.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('producto-movimiento')
export class ProductoMovimientoController {
  constructor(private readonly productoMovimientoService: ProductoMovimientoService) {}


@Post('/id_tipo_mov/:id_tipo_mov')
create(
  @Param('id_tipo_mov', ParseIntPipe) id_tipo_mov: number,
  @Body() createProductoMovimientoDto: CreateProductoMovimientoDto,
) {
  return this.productoMovimientoService.create({...createProductoMovimientoDto, id_tipo_movimiento: id_tipo_mov});
}

  @Get('/id_tipo_mov/:id_tipo_mov')
  findAll(@Query() paginationDto: PaginationDto,  @Param('id_tipo_mov') id_tipo_mov:number) {
    return this.productoMovimientoService.findAll(paginationDto, id_tipo_mov);
  }

  @Get('/id_tipo_mov/:id_tipo_mov/search')
  async search(  @Query() paginationDto: PaginationDto, @Param('id_tipo_mov') id_tipo_mov:number){
    const { q } = paginationDto;
    const { items, total } = await this.productoMovimientoService.findSearch(q as string, paginationDto, id_tipo_mov);
    return {
      items,
      total
    };
  }

  @Get('/id_tipo_mov/:id_tipo_mov/id/:id')
  findOne(@Param('id') id: string) {
    return this.productoMovimientoService.findOne(+id);
  }

  @Patch('/id_tipo_mov/:id_tipo_mov/id/:id')
  update(@Param('id') id: string, @Body() updateProductoMovimientoDto: UpdateProductoMovimientoDto) {
    return this.productoMovimientoService.update(+id, updateProductoMovimientoDto);
  }

  @Delete('/id_tipo_mov/:id_tipo_mov/id/:id')
  remove(@Param('id') id: string) {
    return this.productoMovimientoService.remove(+id);
  }
}
