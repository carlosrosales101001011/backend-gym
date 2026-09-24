import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrenamientoBeneficioDto } from './create-entrenamiento_beneficio.dto';

export class UpdateEntrenamientoBeneficioDto extends PartialType(CreateEntrenamientoBeneficioDto) {}
