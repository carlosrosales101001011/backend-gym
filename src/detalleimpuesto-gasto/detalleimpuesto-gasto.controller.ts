import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetalleimpuestoGastoService } from './detalleimpuesto-gasto.service';
import { CreateDetalleimpuestoGastoDto } from './dto/create-detalleimpuesto-gasto.dto';
import { UpdateDetalleimpuestoGastoDto } from './dto/update-detalleimpuesto-gasto.dto';

@Controller('detalleimpuesto-gasto')
export class DetalleimpuestoGastoController {
  constructor(private readonly detalleimpuestoGastoService: DetalleimpuestoGastoService) {}

  @Post()
  create(@Body() createDetalleimpuestoGastoDto: CreateDetalleimpuestoGastoDto) {
    return this.detalleimpuestoGastoService.create(createDetalleimpuestoGastoDto);
  }

  @Get()
  findAll() {
    return this.detalleimpuestoGastoService.findAll();
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detalleimpuestoGastoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetalleimpuestoGastoDto: UpdateDetalleimpuestoGastoDto) {
    return this.detalleimpuestoGastoService.update(+id, updateDetalleimpuestoGastoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detalleimpuestoGastoService.remove(+id);
  }
}
