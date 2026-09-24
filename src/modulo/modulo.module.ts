import { Module } from '@nestjs/common';
import { ModuloService } from './modulo.service';
import { ModuloController } from './modulo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modulo } from './entities/modulo.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [ModuloController],
  providers: [ModuloService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Modulo])]
})
export class ModuloModule {}
