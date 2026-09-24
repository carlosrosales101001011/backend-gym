import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleimpuestoGastoDto } from './create-detalleimpuesto-gasto.dto';

export class UpdateDetalleimpuestoGastoDto extends PartialType(CreateDetalleimpuestoGastoDto) {}
