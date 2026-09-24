import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DetallepagoGastoService } from './detallepago-gasto.service';
import { CreateDetallepagoGastoDto } from './dto/create-detallepago-gasto.dto';
import { UpdateDetallepagoGastoDto } from './dto/update-detallepago-gasto.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('detallepago-gasto')
export class DetallepagoGastoController {
  constructor(private readonly detallepagoGastoService: DetallepagoGastoService) {}

  @Post()
  create(@Body() createDetallepagoGastoDto: CreateDetallepagoGastoDto) {
    return this.detallepagoGastoService.create(createDetallepagoGastoDto);
  }
  @Post('/bulk')
  createBulk(@Body() createDetallepagoGastoDtos: CreateDetallepagoGastoDto[]) {
    return this.detallepagoGastoService.createBulk(createDetallepagoGastoDtos);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.detallepagoGastoService.findAll(paginationDto);
  }

  @Get('/id_movimiento_financiero/:id_movimiento_financiero')
  findOnexIDMov(@Param('id_movimiento_financiero') id_movimiento_financiero: number) {
    return this.detallepagoGastoService.findOneByIdMovimientoFinanciero(+id_movimiento_financiero);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detallepagoGastoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetallepagoGastoDto: UpdateDetallepagoGastoDto) {
    return this.detallepagoGastoService.update(+id, updateDetallepagoGastoDto);
  }

  
  @Delete('/delete/id_movimiento_financiero/:id_movimiento_financiero')
  removeByIdMovFinanciero(@Param('id_movimiento_financiero') id_movimiento_financiero: string) {
    return this.detallepagoGastoService.removeByIdMovFinanciero(+id_movimiento_financiero);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detallepagoGastoService.remove(+id);
  }
}
