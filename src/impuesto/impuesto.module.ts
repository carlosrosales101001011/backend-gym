import { Module } from '@nestjs/common';
import { ImpuestoService } from './impuesto.service';
import { ImpuestoController } from './impuesto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Impuesto } from './entities/impuesto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [ImpuestoController],
  providers: [ImpuestoService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Impuesto, Terminologia])]
})
export class ImpuestoModule {}
