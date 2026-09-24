import { PartialType } from '@nestjs/mapped-types';
import { CreateContratoEmpleadoDto } from './create-contrato-empleado.dto';

export class UpdateContratoEmpleadoDto extends PartialType(CreateContratoEmpleadoDto) {}
