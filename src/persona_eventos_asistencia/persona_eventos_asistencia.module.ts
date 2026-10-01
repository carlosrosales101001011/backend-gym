import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonaEventosAsistenciaService } from './persona_eventos_asistencia.service';
import { PersonaEventosAsistenciaController } from './persona_eventos_asistencia.controller';
import { PersonaEventosAsistencia } from './entities/persona_eventos_asistencia.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [PersonaEventosAsistenciaController],
  providers: [PersonaEventosAsistenciaService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([PersonaEventosAsistencia, Persona, Terminologia])]
})
export class PersonaEventosAsistenciaModule {}
