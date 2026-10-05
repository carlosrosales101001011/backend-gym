import { Module } from '@nestjs/common';
import { ModuloXUserService } from './modulo-x-user.service';
import { ModuloXUserController } from './modulo-x-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModuloXUser } from './entities/modulo-x-user.entity';
import { UserModule } from 'src/user/user.module';
import { SeccionXModulouser } from 'src/seccion-x-modulouser/entities/seccion-x-modulouser.entity';
import { User } from 'src/user/entities/user.entity';
import { Modulo } from 'src/modulo/entities/modulo.entity';
import { Seccion } from 'src/seccion/entities/seccion.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [ModuloXUserController],
  providers: [ModuloXUserService, FullTextSearchService],
  imports: [UserModule, TypeOrmModule.forFeature([ModuloXUser, SeccionXModulouser, User, Modulo, Seccion])],
  // Lo usa seccion-x-modulouser (mismas reglas de quién administra a quién)
  exports: [ModuloXUserService],
})
export class ModuloXUserModule {}
