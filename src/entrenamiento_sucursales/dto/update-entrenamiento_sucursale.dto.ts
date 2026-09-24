import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrenamientoSucursaleDto } from './create-entrenamiento_sucursale.dto';

export class UpdateEntrenamientoSucursaleDto extends PartialType(CreateEntrenamientoSucursaleDto) {}
