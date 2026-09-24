import { Module } from '@nestjs/common';
import { TerminologiaService } from './terminologia.service';
import { TerminologiaController } from './terminologia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Terminologia } from './entities/terminologia.entity';
import { SeccionXEntidad } from 'src/seccion-x-entidad/entities/seccion-x-entidad.entity';
import { MovimientoFinanciero } from 'src/movimiento-financiero/entities/movimiento-financiero.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [TerminologiaController],
  providers: [TerminologiaService, FullTextSearchService],
  imports: [    
    TypeOrmModule.forFeature([Terminologia, SeccionXEntidad, MovimientoFinanciero]),
  ]
})
export class TerminologiaModule {}
