import { PartialType } from '@nestjs/mapped-types';
import { CreateMarcacionDto } from './create-marcacion.dto';

export class UpdateMarcacionDto extends PartialType(CreateMarcacionDto) {}
