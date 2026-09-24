import { Module } from '@nestjs/common';
import { TipoCambioService } from './tipo-cambio.service';
import { TipoCambioController } from './tipo-cambio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TipoCambio } from './entities/tipo-cambio.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [TipoCambioController],
  providers: [TipoCambioService, FullTextSearchService],
  imports: [
      TypeOrmModule.forFeature([TipoCambio, Terminologia]),
    ]
})
export class TipoCambioModule {}
