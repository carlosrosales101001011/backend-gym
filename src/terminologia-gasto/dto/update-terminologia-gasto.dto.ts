import { PartialType } from '@nestjs/mapped-types';
import { CreateTerminologiaGastoDto } from './create-terminologia-gasto.dto';

export class UpdateTerminologiaGastoDto extends PartialType(CreateTerminologiaGastoDto) {}
