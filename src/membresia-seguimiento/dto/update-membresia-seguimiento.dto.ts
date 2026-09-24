import { PartialType } from '@nestjs/mapped-types';
import { CreateMembresiaSeguimientoDto } from './create-membresia-seguimiento.dto';

export class UpdateMembresiaSeguimientoDto extends PartialType(CreateMembresiaSeguimientoDto) {}
