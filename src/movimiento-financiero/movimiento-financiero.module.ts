import { Module } from '@nestjs/common';
import { MovimientoFinancieroService } from './movimiento-financiero.service';
import { MovimientoFinancieroController } from './movimiento-financiero.controller';
import { MovimientoFinanciero } from './entities/movimiento-financiero.entity';
import { TypeOrmModule } from '@nestjs/typeorm'; 
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([MovimientoFinanciero, Terminologia, Persona]),
  ],
  controllers: [MovimientoFinancieroController],
  providers: [MovimientoFinancieroService, FullTextSearchService],
})
export class MovimientoFinancieroModule {}
