import { Module } from '@nestjs/common';
import { EmpresaAlmacenService } from './empresa-almacen.service';
import { EmpresaAlmacenController } from './empresa-almacen.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaAlmacen } from './entities/empresa-almacen.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { ProductoMovimiento } from 'src/producto-movimiento/entities/producto-movimiento.entity';

@Module({
  controllers: [EmpresaAlmacenController],
  providers: [EmpresaAlmacenService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([EmpresaAlmacen, Terminologia, EmpresaSucursal, ProductoMovimiento])]
})
export class EmpresaAlmacenModule {}
