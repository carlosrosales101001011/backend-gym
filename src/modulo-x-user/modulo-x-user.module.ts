import { Module } from '@nestjs/common';
import { ModuloXUserService } from './modulo-x-user.service';
import { ModuloXUserController } from './modulo-x-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloXUser } from './entities/modulo-x-user.entity';
import { UserModule } from 'src/user/user.module';
import { SeccionXModulouser } from 'src/seccion-x-modulouser/entities/seccion-x-modulouser.entity';

@Module({
  controllers: [ModuloXUserController],
  providers: [ModuloXUserService],
  imports: [UserModule, TypeOrmModule.forFeature([ModuloXUser, SeccionXModulouser])],
})
export class ModuloXUserModule {}
