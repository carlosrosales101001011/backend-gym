import { PartialType } from '@nestjs/mapped-types';
import { CreateModuloXUserDto } from './create-modulo-x-user.dto';

export class UpdateModuloXUserDto extends PartialType(CreateModuloXUserDto) {}
