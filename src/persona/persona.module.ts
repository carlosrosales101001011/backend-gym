import { Module } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { PersonaController } from './persona.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Persona } from './entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Ubigeo } from 'src/ubigeo/entities/ubigeo.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
import { BlobStorageModule } from 'src/blob-storage/blob-storage.module';

@Module({
  controllers: [PersonaController],
  providers: [PersonaService, FullTextSearchService],
  imports: [
    TypeOrmModule.forFeature([Persona, Terminologia, Ubigeo]),
    BlobStorageModule
  ]
})
export class PersonaModule {}
