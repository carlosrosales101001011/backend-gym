import { PartialType } from '@nestjs/mapped-types';
import { CreateEntrenamientoCategoriaDto } from './create-entrenamiento_categoria.dto';

export class UpdateEntrenamientoCategoriaDto extends PartialType(CreateEntrenamientoCategoriaDto) {}
