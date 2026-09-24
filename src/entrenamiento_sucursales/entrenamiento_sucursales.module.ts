import { Module } from '@nestjs/common';
import { EntrenamientoSucursalesService } from './entrenamiento_sucursales.service';
import { EntrenamientoSucursalesController } from './entrenamiento_sucursales.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntrenamientoSucursale } from './entities/entrenamiento_sucursale.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EmpresaSucursal } from 'src/empresa-sucursal/entities/empresa-sucursal.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [EntrenamientoSucursalesController],
  providers: [EntrenamientoSucursalesService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([EntrenamientoSucursale, ProgramaEntrenamiento, EmpresaSucursal])]
})
export class EntrenamientoSucursalesModule {}
