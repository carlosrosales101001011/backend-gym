import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoCambioDto } from './create-tipo-cambio.dto';

export class UpdateTipoCambioDto extends PartialType(CreateTipoCambioDto) {}
