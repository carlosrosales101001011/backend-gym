import { PartialType } from '@nestjs/mapped-types';
import { CreateHorariosespecialesLaborableDto } from './create-horariosespeciales-laborable.dto';

export class UpdateHorariosespecialesLaborableDto extends PartialType(CreateHorariosespecialesLaborableDto) {}
