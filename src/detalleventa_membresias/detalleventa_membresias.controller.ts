import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DetalleventaMembresiasService } from './detalleventa_membresias.service';
import { CreateDetalleventaMembresiaDto } from './dto/create-detalleventa_membresia.dto';
import { UpdateDetalleventaMembresiaDto } from './dto/update-detalleventa_membresia.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('detalleventa-membresias')
export class DetalleventaMembresiasController {
  constructor(private readonly detalleventaMembresiasService: DetalleventaMembresiasService) {}

  @Post()
  create(@Body() createDetalleventaMembresiaDto: CreateDetalleventaMembresiaDto) {
    return this.detalleventaMembresiasService.create(createDetalleventaMembresiaDto);
  }

  @Post('/bulk')
  createBulk(@Body() createDetalleventaMembresiaDto: CreateDetalleventaMembresiaDto[]) {
    return this.detalleventaMembresiasService.createBulk(createDetalleventaMembresiaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.detalleventaMembresiasService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.detalleventaMembresiasService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detalleventaMembresiasService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetalleventaMembresiaDto: UpdateDetalleventaMembresiaDto) {
    return this.detalleventaMembresiasService.update(+id, updateDetalleventaMembresiaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detalleventaMembresiasService.remove(+id);
  }
}
