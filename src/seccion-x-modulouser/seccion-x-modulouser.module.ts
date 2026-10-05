import { Module } from '@nestjs/common';
import { SeccionXModulouserService } from './seccion-x-modulouser.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeccionXModulouser } from './entities/seccion-x-modulouser.entity';
import { SeccionXModulouserController } from './seccion-x-modulouser.controller';
import { UserModule } from 'src/user/user.module';
import { ModuloXUserModule } from 'src/modulo-x-user/modulo-x-user.module';

@Module({
  controllers: [SeccionXModulouserController],
  providers: [SeccionXModulouserService],
  imports: [
        UserModule,
        ModuloXUserModule,
        TypeOrmModule.forFeature([SeccionXModulouser])
      ]
})
export class SeccionXModulouserModule {}
