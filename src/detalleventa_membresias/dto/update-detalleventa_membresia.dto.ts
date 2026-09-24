import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleventaMembresiaDto } from './create-detalleventa_membresia.dto';

export class UpdateDetalleventaMembresiaDto extends PartialType(CreateDetalleventaMembresiaDto) {}
