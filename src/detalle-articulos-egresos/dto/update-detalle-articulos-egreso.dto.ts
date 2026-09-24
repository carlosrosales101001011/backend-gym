import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleArticulosEgresoDto } from './create-detalle-articulos-egreso.dto';

export class UpdateDetalleArticulosEgresoDto extends PartialType(CreateDetalleArticulosEgresoDto) {}
