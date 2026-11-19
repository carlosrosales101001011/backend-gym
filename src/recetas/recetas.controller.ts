import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RecetasService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';

/** Todas las rutas piden sesión iniciada */
@UseGuards(JwtAuthGuard)
@Controller('recetas')
export class RecetasController {
  constructor(private readonly recetasService: RecetasService) {}

  @Post()
  create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.recetasService.create(createRecetaDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.recetasService.findAll(paginationDto);
  }

  @Get('/search')
  search(@Query() paginationDto: PaginationDto) {
    return this.recetasService.findSearch(paginationDto.q ?? '', paginationDto);
  }

  /** Receta con ingredientes, nutrición y alérgenos */
  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.findOne(id);
  }

  @Get('/slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.recetasService.findBySlug(slug);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRecetaDto: UpdateRecetaDto) {
    return this.recetasService.update(id, updateRecetaDto);
  }

  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.recetasService.remove(id);
  }
}
