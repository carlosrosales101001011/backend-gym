import { Module } from '@nestjs/common';
import { UbigeoService } from './ubigeo.service';
import { UbigeoController } from './ubigeo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ubigeo } from './entities/ubigeo.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [UbigeoController],
  providers: [UbigeoService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([Ubigeo])]
})
export class UbigeoModule {}
