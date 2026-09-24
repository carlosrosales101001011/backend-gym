import { PartialType } from '@nestjs/mapped-types';
import { CreateSeccionXEntidadDto } from './create-seccion-x-entidad.dto';

export class UpdateSeccionXEntidadDto extends PartialType(CreateSeccionXEntidadDto) {}
