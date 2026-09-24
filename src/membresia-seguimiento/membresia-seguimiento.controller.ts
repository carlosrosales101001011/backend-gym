import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MembresiaSeguimientoService } from './membresia-seguimiento.service';
import { CreateMembresiaSeguimientoDto } from './dto/create-membresia-seguimiento.dto';
import { UpdateMembresiaSeguimientoDto } from './dto/update-membresia-seguimiento.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('membresia-seguimiento')
export class MembresiaSeguimientoController {
  constructor(private readonly membresiaSeguimientoService: MembresiaSeguimientoService) {}

  @Post()
  create(@Body() createMembresiaSeguimientoDto: CreateMembresiaSeguimientoDto) {
    return this.membresiaSeguimientoService.create(createMembresiaSeguimientoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.membresiaSeguimientoService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.membresiaSeguimientoService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.membresiaSeguimientoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateMembresiaSeguimientoDto: UpdateMembresiaSeguimientoDto) {
    return this.membresiaSeguimientoService.update(+id, updateMembresiaSeguimientoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.membresiaSeguimientoService.remove(+id);
  }
}
