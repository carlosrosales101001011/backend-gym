import { Module } from '@nestjs/common';
import { SeccionXModulouserService } from './seccion-x-modulouser.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionXModulouser } from './entities/seccion-x-modulouser.entity';
import { SeccionXModulouserController } from './seccion-x-modulouser.controller';

@Module({
  controllers: [SeccionXModulouserController],
  providers: [SeccionXModulouserService],
  imports: [
        TypeOrmModule.forFeature([SeccionXModulouser])
      ]
})
export class SeccionXModulouserModule {}
