import { Module } from '@nestjs/common';
import { EntrenamientoPlanService } from './entrenamiento_plan.service';
import { EntrenamientoPlanController } from './entrenamiento_plan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntrenamientoPlan } from './entities/entrenamiento_plan.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [EntrenamientoPlanController],
  providers: [EntrenamientoPlanService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([EntrenamientoPlan, ProgramaEntrenamiento, Terminologia])]
})
export class EntrenamientoPlanModule {}
