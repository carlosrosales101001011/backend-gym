import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrenamientoPlanDto } from './create-entrenamiento_plan.dto';

export class UpdateEntrenamientoPlanDto extends PartialType(CreateEntrenamientoPlanDto) {}
