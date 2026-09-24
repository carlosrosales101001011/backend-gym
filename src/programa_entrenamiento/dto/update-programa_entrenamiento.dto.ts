import { PartialType } from '@nestjs/mapped-types';
import { CreateProgramaEntrenamientoDto } from './create-programa_entrenamiento.dto';

export class UpdateProgramaEntrenamientoDto extends PartialType(CreateProgramaEntrenamientoDto) {}
