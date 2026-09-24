import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Empresa, Terminologia])]
})
export class EmpresaModule {}
