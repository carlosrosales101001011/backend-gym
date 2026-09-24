import { Module } from '@nestjs/common';
import { ProgramaEntrenamientoService } from './programa_entrenamiento.service';
import { ProgramaEntrenamientoController } from './programa_entrenamiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramaEntrenamiento } from './entities/programa_entrenamiento.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { BlobStorageModule } from 'src/blob-storage/blob-storage.module';

@Module({
  controllers: [ProgramaEntrenamientoController],
  providers: [ProgramaEntrenamientoService, FullTextSearchService],
  imports: [
    TypeOrmModule.forFeature([ProgramaEntrenamiento]),
    BlobStorageModule
  ]
})
export class ProgramaEntrenamientoModule {}
