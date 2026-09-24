import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioPermisosService } from './usuario-permisos.service';
import { CreateUsuarioPermisoDto } from './dto/create-usuario-permiso.dto';
import { UpdateUsuarioPermisoDto } from './dto/update-usuario-permiso.dto';

@Controller('usuario-permisos')
export class UsuarioPermisosController {
  constructor(private readonly usuarioPermisosService: UsuarioPermisosService) {}

  @Post()
  create(@Body() createUsuarioPermisoDto: CreateUsuarioPermisoDto) {
    return this.usuarioPermisosService.create(createUsuarioPermisoDto);
  }

  @Get()
  findAll() {
    return this.usuarioPermisosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuarioPermisosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioPermisoDto: UpdateUsuarioPermisoDto) {
    return this.usuarioPermisosService.update(+id, updateUsuarioPermisoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioPermisosService.remove(+id);
  }
}
