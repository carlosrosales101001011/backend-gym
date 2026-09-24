import { PartialType } from '@nestjs/mapped-types';
import { CreateDiasLaborableDto } from './create-dias-laborable.dto';

export class UpdateDiasLaborableDto extends PartialType(CreateDiasLaborableDto) {}
