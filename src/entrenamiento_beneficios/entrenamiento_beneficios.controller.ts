import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntrenamientoBeneficiosService } from './entrenamiento_beneficios.service';
import { CreateEntrenamientoBeneficioDto } from './dto/create-entrenamiento_beneficio.dto';
import { UpdateEntrenamientoBeneficioDto } from './dto/update-entrenamiento_beneficio.dto';

@Controller('entrenamiento-beneficios')
export class EntrenamientoBeneficiosController {
  constructor(private readonly entrenamientoBeneficiosService: EntrenamientoBeneficiosService) {}

  @Post()
  create(@Body() createEntrenamientoBeneficioDto: CreateEntrenamientoBeneficioDto) {
    return this.entrenamientoBeneficiosService.create(createEntrenamientoBeneficioDto);
  }

  @Get()
  findAll() {
    return this.entrenamientoBeneficiosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entrenamientoBeneficiosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntrenamientoBeneficioDto: UpdateEntrenamientoBeneficioDto) {
    return this.entrenamientoBeneficiosService.update(+id, updateEntrenamientoBeneficioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entrenamientoBeneficiosService.remove(+id);
  }
}
