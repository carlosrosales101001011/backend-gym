import { Module } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { PromocionController } from './promocion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promocion } from './entities/promocion.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';

@Module({
  controllers: [PromocionController],
  providers: [PromocionService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Promocion, Terminologia])]
})
export class PromocionModule {}
