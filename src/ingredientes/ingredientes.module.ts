import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngredientesService } from './ingredientes.service';
import { IngredientesController } from './ingredientes.controller';
import { Ingrediente } from './entities/ingrediente.entity';
import { IngredienteUnidad } from 'src/ingrediente_unidad/entities/ingrediente_unidad.entity';
import { IngredienteAlergeno } from 'src/ingrediente_alergeno/entities/ingrediente_alergeno.entity';
import { RecetasIngrediente } from 'src/recetas_ingrediente/entities/recetas_ingrediente.entity';
import { Receta } from 'src/recetas/entities/receta.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [IngredientesController],
  providers: [IngredientesService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Ingrediente, IngredienteUnidad, IngredienteAlergeno, RecetasIngrediente, Receta, Terminologia])],
})
export class IngredientesModule {}
