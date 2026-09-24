import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DetalleArticulosEgresosService } from './detalle-articulos-egresos.service';
import { CreateDetalleArticulosEgresoDto } from './dto/create-detalle-articulos-egreso.dto';
import { UpdateDetalleArticulosEgresoDto } from './dto/update-detalle-articulos-egreso.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('detalleArticulos-gasto')
export class DetalleArticulosEgresosController {
  constructor(private readonly detalleArticulosEgresosService: DetalleArticulosEgresosService) {}

  @Post()
  create(@Body() createDetalleArticulosEgresoDto: CreateDetalleArticulosEgresoDto) {
    return this.detalleArticulosEgresosService.create(createDetalleArticulosEgresoDto);
  }
  
  @Post('/bulk')
  createBulk(@Body() createDetalleArticulosEgresoDto: CreateDetalleArticulosEgresoDto[]) {
    return this.detalleArticulosEgresosService.createBulk(createDetalleArticulosEgresoDto);
  }
     
     
  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.detalleArticulosEgresosService.findAll(paginationDto);
  }

  @Get('/id_movimiento_financiero/:id_movimiento_financiero')
  findOnexIDMov(@Param('id_movimiento_financiero') id_movimiento_financiero: number) {
    return this.detalleArticulosEgresosService.findOneByIdMovimientoFinanciero(+id_movimiento_financiero);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detalleArticulosEgresosService.findOne(+id);
  }

  @Delete('/delete/id_movimiento_financiero/:id_movimiento_financiero')
  removeByIdMovFinanciero(@Param('id_movimiento_financiero') id_movimiento_financiero: string) {
    return this.detalleArticulosEgresosService.removeByIdMovFinanciero(+id_movimiento_financiero);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetalleArticulosEgresoDto: UpdateDetalleArticulosEgresoDto) {
    return this.detalleArticulosEgresosService.update(+id, updateDetalleArticulosEgresoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detalleArticulosEgresosService.remove(+id);
  }
}
