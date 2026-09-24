import { Module } from '@nestjs/common';
import { EntrenamientoHorarioService } from './entrenamiento_horario.service';
import { EntrenamientoHorarioController } from './entrenamiento_horario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntrenamientoHorario } from './entities/entrenamiento_horario.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [EntrenamientoHorarioController],
  providers: [EntrenamientoHorarioService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([EntrenamientoHorario, ProgramaEntrenamiento, Persona])]
})
export class EntrenamientoHorarioModule {}
