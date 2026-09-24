import { Module } from '@nestjs/common';
import { DetalleventaProductosService } from './detalleventa_productos.service';
import { DetalleventaProductosController } from './detalleventa_productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleventaProducto } from './entities/detalleventa_producto.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [DetalleventaProductosController],
  providers: [DetalleventaProductosService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([DetalleventaProducto, Producto, Venta])]
})
export class DetalleventaProductosModule {}
