import { Module } from '@nestjs/common';
import { TerminologiaGastoService } from './terminologia-gasto.service';
import { TerminologiaGastoController } from './terminologia-gasto.controller';
import { TerminologiaGasto } from './entities/terminologia-gasto.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminologiaGrupoMovimiento } from 'src/terminologia-grupo-movimiento/entities/terminologia-grupo-movimiento.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [TerminologiaGastoController],
  providers: [TerminologiaGastoService, FullTextSearchService],
  imports: [
    TypeOrmModule.forFeature([TerminologiaGasto, TerminologiaGrupoMovimiento, Terminologia]),
  ],
})
export class TerminologiaGastoModule {}
