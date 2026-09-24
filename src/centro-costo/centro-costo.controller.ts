import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CentroCostoService } from './centro-costo.service';
import { CreateCentroCostoDto } from './dto/create-centro-costo.dto';
import { UpdateCentroCostoDto } from './dto/update-centro-costo.dto';

@Controller('centro-costo')
export class CentroCostoController {
  constructor(private readonly centroCostoService: CentroCostoService) {}

  @Post()
  create(@Body() createCentroCostoDto: CreateCentroCostoDto) {
    return this.centroCostoService.create(createCentroCostoDto);
  }

  @Get()
  findAll() {
    return this.centroCostoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.centroCostoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCentroCostoDto: UpdateCentroCostoDto) {
    return this.centroCostoService.update(+id, updateCentroCostoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.centroCostoService.remove(+id);
  }
}
