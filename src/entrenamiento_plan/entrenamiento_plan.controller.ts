import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EntrenamientoPlanService } from './entrenamiento_plan.service';
import { CreateEntrenamientoPlanDto } from './dto/create-entrenamiento_plan.dto';
import { UpdateEntrenamientoPlanDto } from './dto/update-entrenamiento_plan.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('entrenamiento-plan')
export class EntrenamientoPlanController {
  constructor(private readonly entrenamientoPlanService: EntrenamientoPlanService) {}

  @Post()
  create(@Body() createEntrenamientoPlanDto: CreateEntrenamientoPlanDto) {
    return this.entrenamientoPlanService.create(createEntrenamientoPlanDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.entrenamientoPlanService.findAll(paginationDto);
  }

  @Get('/id_programa/:id_programa')
  findAllByPrograma(@Param('id_programa') id_programa: string) {
    return this.entrenamientoPlanService.findAllByPrograma(+id_programa);
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.entrenamientoPlanService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.entrenamientoPlanService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateEntrenamientoPlanDto: UpdateEntrenamientoPlanDto) {
    return this.entrenamientoPlanService.update(+id, updateEntrenamientoPlanDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.entrenamientoPlanService.remove(+id);
  }
}
