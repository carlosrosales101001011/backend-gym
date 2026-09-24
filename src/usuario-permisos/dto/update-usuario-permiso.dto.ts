import { PartialType } from '@nestjs/mapped-types';
import { CreateUsuarioPermisoDto } from './create-usuario-permiso.dto';

export class UpdateUsuarioPermisoDto extends PartialType(CreateUsuarioPermisoDto) {}
