import { PartialType } from '@nestjs/mapped-types';
import { CreateVentasMetaDto } from './create-ventas-meta.dto';

export class UpdateVentasMetaDto extends PartialType(CreateVentasMetaDto) {}
