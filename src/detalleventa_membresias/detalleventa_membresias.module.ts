import { Module } from '@nestjs/common';
import { DetalleventaMembresiasService } from './detalleventa_membresias.service';
import { DetalleventaMembresiasController } from './detalleventa_membresias.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleventaMembresia } from './entities/detalleventa_membresia.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { EntrenamientoPlan } from 'src/entrenamiento_plan/entities/entrenamiento_plan.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EntrenamientoHorario } from 'src/entrenamiento_horario/entities/entrenamiento_horario.entity';
import { MembresiaSeguimientoModule } from 'src/membresia-seguimiento/membresia-seguimiento.module';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [DetalleventaMembresiasController],
  providers: [DetalleventaMembresiasService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([DetalleventaMembresia, Venta, EntrenamientoPlan, ProgramaEntrenamiento, EntrenamientoHorario]), MembresiaSeguimientoModule]
})
export class DetalleventaMembresiasModule {}
