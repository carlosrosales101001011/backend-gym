import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleventaProductoDto } from './create-detalleventa_producto.dto';

export class UpdateDetalleventaProductoDto extends PartialType(CreateDetalleventaProductoDto) {}
