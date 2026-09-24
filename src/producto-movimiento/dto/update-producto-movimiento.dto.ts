import { PartialType } from '@nestjs/mapped-types';
import { CreateProductoMovimientoDto } from './create-producto-movimiento.dto';

export class UpdateProductoMovimientoDto extends PartialType(CreateProductoMovimientoDto) {}
