import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { Receta } from './entities/receta.entity';
import { RecetasIngrediente } from 'src/recetas_ingrediente/entities/recetas_ingrediente.entity';
import { Ingrediente } from 'src/ingredientes/entities/ingrediente.entity';
import { IngredienteUnidad } from 'src/ingrediente_unidad/entities/ingrediente_unidad.entity';
import { IngredienteAlergeno } from 'src/ingrediente_alergeno/entities/ingrediente_alergeno.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [RecetasController],
  providers: [RecetasService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Receta, RecetasIngrediente, Ingrediente, IngredienteUnidad, IngredienteAlergeno])],
})
export class RecetasModule {}
