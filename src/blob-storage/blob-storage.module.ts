import { Module } from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';
import { BlobStorageController } from './blob-storage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlobStorage } from './entities/blob-storage.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [BlobStorageController],
  providers: [BlobStorageService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([BlobStorage, Terminologia])],
  exports: [BlobStorageService]
})
export class BlobStorageModule {}
