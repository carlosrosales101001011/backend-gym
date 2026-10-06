import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { AgendaNutricionistaService } from './agenda-nutricionista.service';
import { CreateAgendaNutricionistaDto } from './dto/create-agenda-nutricionista.dto';
import { UpdateAgendaNutricionistaDto } from './dto/update-agenda-nutricionista.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('agenda-nutricionista')
export class AgendaNutricionistaController {
  constructor(private readonly agendaNutricionistaService: AgendaNutricionistaService) {}

  @Post()
  create(@Body() createAgendaNutricionistaDto: CreateAgendaNutricionistaDto) {
    return this.agendaNutricionistaService.create(createAgendaNutricionistaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.agendaNutricionistaService.findAll(paginationDto);
  }

  @Get('/search')
  search(@Query() paginationDto: PaginationDto) {
    return this.agendaNutricionistaService.findSearch(paginationDto.q as string, paginationDto);
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendaNutricionistaService.findOne(id);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAgendaNutricionistaDto: UpdateAgendaNutricionistaDto) {
    return this.agendaNutricionistaService.update(id, updateAgendaNutricionistaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.agendaNutricionistaService.remove(id);
  }
}
