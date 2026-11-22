import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AgendaNutricionistaService } from './agenda-nutricionista.service';
import { CreateAgendaNutricionistaDto } from './dto/create-agenda-nutricionista.dto';
import { UpdateAgendaNutricionistaDto } from './dto/update-agenda-nutricionista.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { BuscarAgendaRangoDto } from './dto/buscar-agenda-rango.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';

// Con sesión: las citas "Importante" solo las crea y modifica un super usuario
@UseGuards(JwtAuthGuard)
@Controller('agenda-nutricionista')
export class AgendaNutricionistaController {
  constructor(private readonly agendaNutricionistaService: AgendaNutricionistaService) {}

  @Post()
  create(@Body() createAgendaNutricionistaDto: CreateAgendaNutricionistaDto, @Auditor() auditor: ContextoAuditoria) {
    return this.agendaNutricionistaService.create(createAgendaNutricionistaDto, auditor);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.agendaNutricionistaService.findAll(paginationDto);
  }

  /** Citas activas entre fecha_inicio y fecha_fin; con q, todas las citas de los clientes que coinciden */
  @Get('/rango')
  findRango(@Query() buscarAgendaRangoDto: BuscarAgendaRangoDto) {
    return this.agendaNutricionistaService.findRango(buscarAgendaRangoDto);
  }

  @Get('/search')
  search(@Query() paginationDto: PaginationDto) {
    return this.agendaNutricionistaService.findSearch(paginationDto.q as string, paginationDto);
  }

  /** Citas activas de un cliente, la más reciente primero */
  @Get('/id_cli/:id_cli')
  findByIdCli(@Param('id_cli', ParseIntPipe) id_cli: number) {
    return this.agendaNutricionistaService.findByIdCli(id_cli);
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.agendaNutricionistaService.findOne(id);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAgendaNutricionistaDto: UpdateAgendaNutricionistaDto, @Auditor() auditor: ContextoAuditoria) {
    return this.agendaNutricionistaService.update(id, updateAgendaNutricionistaDto, auditor);
  }

  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number, @Auditor() auditor: ContextoAuditoria) {
    return this.agendaNutricionistaService.remove(id, auditor);
  }
}
