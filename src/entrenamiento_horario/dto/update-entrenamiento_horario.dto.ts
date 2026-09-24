import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrenamientoHorarioDto } from './create-entrenamiento_horario.dto';

export class UpdateEntrenamientoHorarioDto extends PartialType(CreateEntrenamientoHorarioDto) {}
