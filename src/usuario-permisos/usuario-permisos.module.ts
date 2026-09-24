import { Module } from '@nestjs/common';
import { UsuarioPermisosService } from './usuario-permisos.service';
import { UsuarioPermisosController } from './usuario-permisos.controller';

@Module({
  controllers: [UsuarioPermisosController],
  providers: [UsuarioPermisosService],
})
export class UsuarioPermisosModule {}
