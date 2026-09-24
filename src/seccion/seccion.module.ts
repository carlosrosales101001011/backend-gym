import { Module } from '@nestjs/common';
import { SeccionService } from './seccion.service';
import { SeccionController } from './seccion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Seccion } from './entities/seccion.entity';
import { SeccionXEntidad } from 'src/seccion-x-entidad/entities/seccion-x-entidad.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [SeccionController],
  providers: [SeccionService, FullTextSearchService],
  imports: [
      TypeOrmModule.forFeature([Seccion, SeccionXEntidad])
    ]
})
export class SeccionModule {}
