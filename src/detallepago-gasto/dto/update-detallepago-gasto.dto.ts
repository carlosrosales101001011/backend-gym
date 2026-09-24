import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallepagoGastoDto } from './create-detallepago-gasto.dto';

export class UpdateDetallepagoGastoDto extends PartialType(CreateDetallepagoGastoDto) {}
