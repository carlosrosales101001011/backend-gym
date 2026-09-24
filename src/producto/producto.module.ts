import { Module } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { ProductoController } from './producto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from './entities/producto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { EmpresaAlmacen } from 'src/empresa-almacen/entities/empresa-almacen.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { ProductoMovimientoModule } from 'src/producto-movimiento/producto-movimiento.module';

@Module({
  controllers: [ProductoController],
  providers: [ProductoService, FullTextSearchService],
  imports: [
    TypeOrmModule.forFeature([Producto, Terminologia, EmpresaSucursal, EmpresaAlmacen]),
    ProductoMovimientoModule
  ]
})
export class ProductoModule {}
