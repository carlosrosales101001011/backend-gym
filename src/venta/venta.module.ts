import { Module } from '@nestjs/common';
import { VentaService } from './venta.service';
import { VentaController } from './venta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from './entities/venta.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { DetalleventaMembresia } from 'src/detalleventa_membresias/entities/detalleventa_membresia.entity';
import { DetalleventaProducto } from 'src/detalleventa_productos/entities/detalleventa_producto.entity';
import { DetalleventaPago } from 'src/detalleventa_pagos/entities/detalleventa_pago.entity';
import { MembresiaSeguimientoModule } from 'src/membresia-seguimiento/membresia-seguimiento.module';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [VentaController],
  providers: [VentaService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Venta, Persona, Terminologia, EmpresaSucursal, DetalleventaMembresia, DetalleventaProducto, DetalleventaPago]), MembresiaSeguimientoModule]
})
export class VentaModule {}
