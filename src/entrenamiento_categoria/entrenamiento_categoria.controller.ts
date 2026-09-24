import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EntrenamientoCategoriaService } from './entrenamiento_categoria.service';
import { CreateEntrenamientoCategoriaDto } from './dto/create-entrenamiento_categoria.dto';
import { UpdateEntrenamientoCategoriaDto } from './dto/update-entrenamiento_categoria.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('entrenamiento-categoria')
export class EntrenamientoCategoriaController {
  constructor(private readonly entrenamientoCategoriaService: EntrenamientoCategoriaService) {}

  @Post()
  create(@Body() createEntrenamientoCategoriaDto: CreateEntrenamientoCategoriaDto) {
    return this.entrenamientoCategoriaService.create(createEntrenamientoCategoriaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.entrenamientoCategoriaService.findAll(paginationDto);
  }

  @Get('/id_programa/:id_programa')
  findAllByPrograma(@Param('id_programa') id_programa: string) {
    return this.entrenamientoCategoriaService.findAllByPrograma(+id_programa);
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.entrenamientoCategoriaService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.entrenamientoCategoriaService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateEntrenamientoCategoriaDto: UpdateEntrenamientoCategoriaDto) {
    return this.entrenamientoCategoriaService.update(+id, updateEntrenamientoCategoriaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.entrenamientoCategoriaService.remove(+id);
  }
}
