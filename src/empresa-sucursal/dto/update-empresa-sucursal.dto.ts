import { PartialType } from '@nestjs/mapped-types';
import { CreateEmpresaSucursalDto } from './create-empresa-sucursal.dto';

export class UpdateEmpresaSucursalDto extends PartialType(CreateEmpresaSucursalDto) {}
