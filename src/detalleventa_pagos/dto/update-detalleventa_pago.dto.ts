import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleventaPagoDto } from './create-detalleventa_pago.dto';

export class UpdateDetalleventaPagoDto extends PartialType(CreateDetalleventaPagoDto) {}
