import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TerminologiaGrupoMovimientoService } from './terminologia-grupo-movimiento.service';
import { CreateTerminologiaGrupoMovimientoDto } from './dto/create-terminologia-grupo-movimiento.dto';
import { UpdateTerminologiaGrupoMovimientoDto } from './dto/update-terminologia-grupo-movimiento.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('terminologia-grupo-movimiento')
export class TerminologiaGrupoMovimientoController {
  constructor(private readonly terminologiaGrupoMovimientoService: TerminologiaGrupoMovimientoService) {}

  @Post()
  create(@Body() createTerminologiaGrupoMovimientoDto: CreateTerminologiaGrupoMovimientoDto) {
    return this.terminologiaGrupoMovimientoService.create(createTerminologiaGrupoMovimientoDto);
  }

  @Get('/id_tipo_movimiento/:id_tipo_movimiento')
  findAll(@Query() paginationDto: PaginationDto, @Param('id_tipo_movimiento') id_tipo_movimiento: number) {
    return this.terminologiaGrupoMovimientoService.findAll(paginationDto, +id_tipo_movimiento);
  }

  @Get('/search/id_tipo_movimiento/:id_tipo_movimiento')
  async search(  @Query() paginationDto: PaginationDto, @Param('id_tipo_movimiento') id_tipo_movimiento: number){
    const { q } = paginationDto;
    const { items, total } = await this.terminologiaGrupoMovimientoService.findSearch(q as string, paginationDto, +id_tipo_movimiento);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.terminologiaGrupoMovimientoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateTerminologiaGrupoMovimientoDto: UpdateTerminologiaGrupoMovimientoDto) {
    return this.terminologiaGrupoMovimientoService.update(+id, updateTerminologiaGrupoMovimientoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.terminologiaGrupoMovimientoService.remove(+id);
  }
}
