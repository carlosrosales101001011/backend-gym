import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MovimientoFinancieroService } from './movimiento-financiero.service';
import { CreateMovimientoFinancieroDto } from './dto/create-movimiento-financiero.dto';
import { UpdateMovimientoFinancieroDto } from './dto/update-movimiento-financiero.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('movimiento-financiero')
export class MovimientoFinancieroController {
  constructor(private readonly movimientoFinancieroService: MovimientoFinancieroService) {}

  @Post('/:id_tipo_movimiento')
  create(@Param('id_tipo_movimiento') id_tipo_movimiento: number, @Body() createMovimientoFinancieroDto: CreateMovimientoFinancieroDto) {
    // createMovimientoFinancieroDto.id_tipo_movimiento = (id_tipo_movimiento);
    return this.movimientoFinancieroService.create(createMovimientoFinancieroDto);
  }

  @Get('/:id_tipo_movimiento')
  findAll(@Param('id_tipo_movimiento') id_tipo_movimiento: number, @Query() paginationDto: PaginationDto) {
    return this.movimientoFinancieroService.findAll(id_tipo_movimiento, paginationDto);
  }
  
  @Get('/id_tipo_movimiento/:id_tipo_movimiento/search')
  async search(  @Query() paginationDto: PaginationDto, @Param('id_tipo_movimiento') id_tipo_movimiento: number){
    const { q } = paginationDto;
    const { items, total } = await this.movimientoFinancieroService.findSearch(q as string, paginationDto, +id_tipo_movimiento);
    return {
      items,
      total
    };
  }
  @Get('/:id_tipo_movimiento/id/:id')
  findOne(@Param('id_tipo_movimiento') id_tipo_movimiento: number, @Param('id') id: string) {
    return this.movimientoFinancieroService.findOne(id_tipo_movimiento, +id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateMovimientoFinancieroDto: UpdateMovimientoFinancieroDto) {
    return this.movimientoFinancieroService.update(+id, updateMovimientoFinancieroDto);
  }

  @Delete('/delete/id/:id')
  remove( @Param('id') id: string) {
    return this.movimientoFinancieroService.remove(+id);
  }
}
