import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DetalleventaProductosService } from './detalleventa_productos.service';
import { CreateDetalleventaProductoDto } from './dto/create-detalleventa_producto.dto';
import { UpdateDetalleventaProductoDto } from './dto/update-detalleventa_producto.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('detalleventa-productos')
export class DetalleventaProductosController {
  constructor(private readonly detalleventaProductosService: DetalleventaProductosService) {}

  @Post()
  create(@Body() createDetalleventaProductoDto: CreateDetalleventaProductoDto) {
    return this.detalleventaProductosService.create(createDetalleventaProductoDto);
  }

  @Post('/bulk')
  createBulk(@Body() createDetalleventaProductoDto: CreateDetalleventaProductoDto[]) {
    return this.detalleventaProductosService.createBulk(createDetalleventaProductoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.detalleventaProductosService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.detalleventaProductosService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detalleventaProductosService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetalleventaProductoDto: UpdateDetalleventaProductoDto) {
    return this.detalleventaProductosService.update(+id, updateDetalleventaProductoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detalleventaProductosService.remove(+id);
  }
}
