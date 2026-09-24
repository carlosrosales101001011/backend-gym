import { PartialType } from '@nestjs/mapped-types';
import { CreateTerminologiaDto } from './create-terminologia.dto';

export class UpdateTerminologiaDto extends PartialType(CreateTerminologiaDto) {}
