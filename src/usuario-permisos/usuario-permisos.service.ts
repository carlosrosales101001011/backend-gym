import { Injectable } from '@nestjs/common';
import { CreateUsuarioPermisoDto } from './dto/create-usuario-permiso.dto';
import { UpdateUsuarioPermisoDto } from './dto/update-usuario-permiso.dto';

@Injectable()
export class UsuarioPermisosService {
  create(createUsuarioPermisoDto: CreateUsuarioPermisoDto) {
    return 'This action adds a new usuarioPermiso';
  }

  findAll() {
    return `This action returns all usuarioPermisos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} usuarioPermiso`;
  }

  update(id: number, updateUsuarioPermisoDto: UpdateUsuarioPermisoDto) {
    return `This action updates a #${id} usuarioPermiso`;
  }

  remove(id: number) {
    return `This action removes a #${id} usuarioPermiso`;
  }
}
