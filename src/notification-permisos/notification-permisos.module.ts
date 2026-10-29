import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationPermisosService } from './notification-permisos.service';
import { NotificationPermisosController } from './notification-permisos.controller';
import { NotificationPermiso } from './entities/notification-permiso.entity';
import { User } from 'src/user/entities/user.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';

@Module({
  controllers: [NotificationPermisosController],
  providers: [NotificationPermisosService],
  imports: [TypeOrmModule.forFeature([NotificationPermiso, User, Terminologia])],
})
export class NotificationPermisosModule {}
