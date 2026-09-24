import { Module } from '@nestjs/common';
import { SeccionXEntidadService } from './seccion-x-entidad.service';
import { SeccionXEntidadController } from './seccion-x-entidad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionXEntidad } from './entities/seccion-x-entidad.entity';
import { Seccion } from 'src/seccion/entities/seccion.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';

@Module({
  controllers: [SeccionXEntidadController],
  providers: [SeccionXEntidadService],
  imports: [TypeOrmModule.forFeature([SeccionXEntidad, Seccion, Terminologia])]
})
export class SeccionXEntidadModule {}
