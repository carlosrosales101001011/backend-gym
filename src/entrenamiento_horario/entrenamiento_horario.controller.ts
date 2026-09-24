import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EntrenamientoHorarioService } from './entrenamiento_horario.service';
import { CreateEntrenamientoHorarioDto } from './dto/create-entrenamiento_horario.dto';
import { UpdateEntrenamientoHorarioDto } from './dto/update-entrenamiento_horario.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('entrenamiento-horario')
export class EntrenamientoHorarioController {
  constructor(private readonly entrenamientoHorarioService: EntrenamientoHorarioService) {}

  @Post()
  create(@Body() createEntrenamientoHorarioDto: CreateEntrenamientoHorarioDto) {
    return this.entrenamientoHorarioService.create(createEntrenamientoHorarioDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.entrenamientoHorarioService.findAll(paginationDto);
  }

  @Get('/id_programa/:id_programa')
  findAllByPrograma(@Param('id_programa') id_programa: string) {
    return this.entrenamientoHorarioService.findAllByPrograma(+id_programa);
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.entrenamientoHorarioService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.entrenamientoHorarioService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateEntrenamientoHorarioDto: UpdateEntrenamientoHorarioDto) {
    return this.entrenamientoHorarioService.update(+id, updateEntrenamientoHorarioDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.entrenamientoHorarioService.remove(+id);
  }
}
