import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaAlmacenDto } from './create-empresa-almacen.dto';

export class UpdateEmpresaAlmacenDto extends PartialType(CreateEmpresaAlmacenDto) {}
