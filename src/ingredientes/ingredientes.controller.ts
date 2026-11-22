import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { IngredientesService } from './ingredientes.service';
import { CreateIngredienteDto } from './dto/create-ingrediente.dto';
import { UpdateIngredienteDto } from './dto/update-ingrediente.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';

/** Todas las rutas piden sesión iniciada */
@UseGuards(JwtAuthGuard)
@Controller('ingredientes')
export class IngredientesController {
  constructor(private readonly ingredientesService: IngredientesService) {}

  @Post()
  create(@Body() createIngredienteDto: CreateIngredienteDto, @Auditor() auditor: ContextoAuditoria) {
    return this.ingredientesService.create(createIngredienteDto, auditor);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ingredientesService.findAll(paginationDto);
  }

  @Get('/search')
  search(@Query() paginationDto: PaginationDto) {
    return this.ingredientesService.findSearch(paginationDto.q ?? '', paginationDto);
  }

  /** Ingredientes activos con sus unidades, para el formulario de recetas */
  @Get('/opciones')
  findOpciones() {
    return this.ingredientesService.findOpciones();
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ingredientesService.findOne(id);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateIngredienteDto: UpdateIngredienteDto, @Auditor() auditor: ContextoAuditoria) {
    return this.ingredientesService.update(id, updateIngredienteDto, auditor);
  }

  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number, @Auditor() auditor: ContextoAuditoria) {
    return this.ingredientesService.remove(id, auditor);
  }
}
