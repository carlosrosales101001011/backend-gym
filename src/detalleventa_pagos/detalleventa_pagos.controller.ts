import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DetalleventaPagosService } from './detalleventa_pagos.service';
import { CreateDetalleventaPagoDto } from './dto/create-detalleventa_pago.dto';
import { UpdateDetalleventaPagoDto } from './dto/update-detalleventa_pago.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('detalleventa-pagos')
export class DetalleventaPagosController {
  constructor(private readonly detalleventaPagosService: DetalleventaPagosService) {}

  @Post()
  create(@Body() createDetalleventaPagoDto: CreateDetalleventaPagoDto) {
    return this.detalleventaPagosService.create(createDetalleventaPagoDto);
  }

  @Post('/bulk')
  createBulk(@Body() createDetalleventaPagoDto: CreateDetalleventaPagoDto[]) {
    console.log({createDetalleventaPagoDto});
    
    return this.detalleventaPagosService.createBulk(createDetalleventaPagoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.detalleventaPagosService.findAll(paginationDto);
  }

  @Get('/id_venta/:id_venta')
  findByIdVenta(@Param('id_venta') id_venta: string) {
    return this.detalleventaPagosService.findByIdVenta(+id_venta);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.detalleventaPagosService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateDetalleventaPagoDto: UpdateDetalleventaPagoDto) {
    return this.detalleventaPagosService.update(+id, updateDetalleventaPagoDto);
  }

  @Delete('/delete/id_venta/:id_venta')
  removeByIdVenta(@Param('id_venta') id_venta: string) {
    return this.detalleventaPagosService.removeByIdVenta(+id_venta);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.detalleventaPagosService.remove(+id);
  }
}
