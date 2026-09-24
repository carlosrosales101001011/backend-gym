import { PartialType } from '@nestjs/mapped-types';
import { CreateCuentasFinancieraDto } from './create-cuentas-financiera.dto';

export class UpdateCuentasFinancieraDto extends PartialType(CreateCuentasFinancieraDto) {}
