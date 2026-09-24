import { Module } from '@nestjs/common';
import { ProductoMovimientoService } from './producto-movimiento.service';
import { ProductoMovimientoController } from './producto-movimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoMovimiento } from './entities/producto-movimiento.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { EmpresaAlmacen } from 'src/empresa-almacen/entities/empresa-almacen.entity';

@Module({
  controllers: [ProductoMovimientoController],
  providers: [ProductoMovimientoService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([ProductoMovimiento, Producto, Terminologia, EmpresaSucursal, EmpresaAlmacen])],
  exports: [ProductoMovimientoService]
})
export class ProductoMovimientoModule {}
