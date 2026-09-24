import { Module } from '@nestjs/common';
import { EntrenamientoCategoriaService } from './entrenamiento_categoria.service';
import { EntrenamientoCategoriaController } from './entrenamiento_categoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntrenamientoCategoria } from './entities/entrenamiento_categoria.entity';
import { ProgramaEntrenamiento } from 'src/programa_entrenamiento/entities/programa_entrenamiento.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [EntrenamientoCategoriaController],
  providers: [EntrenamientoCategoriaService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([EntrenamientoCategoria, ProgramaEntrenamiento, Terminologia])]
})
export class EntrenamientoCategoriaModule {}
