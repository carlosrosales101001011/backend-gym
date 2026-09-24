import { PartialType } from '@nestjs/mapped-types';
import { CreateSeccionXModulouserDto } from './create-seccion-x-modulouser.dto';

export class UpdateSeccionXModulouserDto extends PartialType(CreateSeccionXModulouserDto) {}
