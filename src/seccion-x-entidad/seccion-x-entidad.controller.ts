import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SeccionXEntidadService } from './seccion-x-entidad.service';
import { CreateSeccionXEntidadDto } from './dto/create-seccion-x-entidad.dto';
import { UpdateSeccionXEntidadDto } from './dto/update-seccion-x-entidad.dto';

@Controller('seccion-x-entidad')
export class SeccionXEntidadController {
  constructor(private readonly seccionXEntidadService: SeccionXEntidadService) {}

  @Post()
  create(@Body() createSeccionXEntidadDto: CreateSeccionXEntidadDto) {
    return this.seccionXEntidadService.create(createSeccionXEntidadDto);
  }

  @Get()
  findAll() {
    return this.seccionXEntidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seccionXEntidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeccionXEntidadDto: UpdateSeccionXEntidadDto) {
    return this.seccionXEntidadService.update(+id, updateSeccionXEntidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seccionXEntidadService.remove(+id);
  }
}
