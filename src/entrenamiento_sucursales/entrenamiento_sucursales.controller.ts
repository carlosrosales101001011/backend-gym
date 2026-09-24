import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EntrenamientoSucursalesService } from './entrenamiento_sucursales.service';
import { CreateEntrenamientoSucursaleDto } from './dto/create-entrenamiento_sucursale.dto';
import { UpdateEntrenamientoSucursaleDto } from './dto/update-entrenamiento_sucursale.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('entrenamiento-sucursales')
export class EntrenamientoSucursalesController {
  constructor(private readonly entrenamientoSucursalesService: EntrenamientoSucursalesService) {}

  @Post()
  create(@Body() createEntrenamientoSucursaleDto: CreateEntrenamientoSucursaleDto) {
    return this.entrenamientoSucursalesService.create(createEntrenamientoSucursaleDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.entrenamientoSucursalesService.findAll(paginationDto);
  }

  @Get('/id_programa/:id_programa')
  findAllByPrograma(@Param('id_programa') id_programa: string) {
    return this.entrenamientoSucursalesService.findAllByPrograma(+id_programa);
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.entrenamientoSucursalesService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.entrenamientoSucursalesService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateEntrenamientoSucursaleDto: UpdateEntrenamientoSucursaleDto) {
    return this.entrenamientoSucursalesService.update(+id, updateEntrenamientoSucursaleDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.entrenamientoSucursalesService.remove(+id);
  }
}
