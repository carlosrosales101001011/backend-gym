import { Module } from '@nestjs/common';
import { TerminologiaGrupoMovimientoService } from './terminologia-grupo-movimiento.service';
import { TerminologiaGrupoMovimientoController } from './terminologia-grupo-movimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TerminologiaGrupoMovimiento } from './entities/terminologia-grupo-movimiento.entity';
import { TerminologiaGasto } from 'src/terminologia-gasto/entities/terminologia-gasto.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TerminologiaGrupoMovimiento, TerminologiaGasto]),
  ],
  controllers: [TerminologiaGrupoMovimientoController],
  providers: [TerminologiaGrupoMovimientoService, FullTextSearchService],
})
export class TerminologiaGrupoMovimientoModule {}
