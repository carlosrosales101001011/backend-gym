import { Module } from '@nestjs/common';
import { EmpresaSucursalService } from './empresa-sucursal.service';
import { EmpresaSucursalController } from './empresa-sucursal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmpresaSucursal } from './entities/empresa-sucursal.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { User } from 'src/user/entities/user.entity';
import { EmpresaAlmacen } from 'src/empresa-almacen/entities/empresa-almacen.entity';
import { ProductoMovimiento } from 'src/producto-movimiento/entities/producto-movimiento.entity';

@Module({
  controllers: [EmpresaSucursalController],
  providers: [EmpresaSucursalService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([EmpresaSucursal, Terminologia, Empresa, Persona, User, EmpresaAlmacen, ProductoMovimiento])]
})
export class EmpresaSucursalModule {}
