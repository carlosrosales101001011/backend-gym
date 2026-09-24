import { Module } from '@nestjs/common';
import { DetalleventaPagosService } from './detalleventa_pagos.service';
import { DetalleventaPagosController } from './detalleventa_pagos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleventaPago } from './entities/detalleventa_pago.entity';
import { Venta } from 'src/venta/entities/venta.entity';

@Module({
  controllers: [DetalleventaPagosController],
  providers: [DetalleventaPagosService],
  imports: [TypeOrmModule.forFeature([DetalleventaPago, Venta])]
})
export class DetalleventaPagosModule {}
