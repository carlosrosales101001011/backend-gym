import { Module } from '@nestjs/common';
import { MembresiaExtensionService } from './membresia_extension.service';
import { MembresiaExtensionController } from './membresia_extension.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembresiaExtension } from './entities/membresia_extension.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { EntrenamientoPlan } from 'src/entrenamiento_plan/entities/entrenamiento_plan.entity';
import { MembresiaSeguimientoModule } from 'src/membresia-seguimiento/membresia-seguimiento.module';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [MembresiaExtensionController],
  providers: [MembresiaExtensionService, FullTextSearchService],
  imports: [
    TypeOrmModule.forFeature([MembresiaExtension, Venta, Terminologia, ProgramaEntrenamiento, EntrenamientoPlan]),
    MembresiaSeguimientoModule
  ]
})
export class MembresiaExtensionModule {}
