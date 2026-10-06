import { PartialType } from '@nestjs/mapped-types';
import { CreateAgendaNutricionistaDto } from './create-agenda-nutricionista.dto';

export class UpdateAgendaNutricionistaDto extends PartialType(CreateAgendaNutricionistaDto) {}
