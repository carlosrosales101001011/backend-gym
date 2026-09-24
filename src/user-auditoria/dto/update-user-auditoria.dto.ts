import { PartialType } from '@nestjs/mapped-types';
import { CreateUserAuditoriaDto } from './create-user-auditoria.dto';

export class UpdateUserAuditoriaDto extends PartialType(CreateUserAuditoriaDto) {}
