import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaNutricionistaService } from './agenda-nutricionista.service';
import { AgendaNutricionistaController } from './agenda-nutricionista.controller';
import { AgendaNutricionista } from './entities/agenda-nutricionista.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [AgendaNutricionistaController],
  providers: [AgendaNutricionistaService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([AgendaNutricionista, Persona, Terminologia])],
})
export class AgendaNutricionistaModule {}
