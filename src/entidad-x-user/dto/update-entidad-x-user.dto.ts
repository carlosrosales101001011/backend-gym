import { PartialType } from '@nestjs/mapped-types';
import { CreateEntidadXUserDto } from './create-entidad-x-user.dto';

export class UpdateEntidadXUserDto extends PartialType(CreateEntidadXUserDto) {}
