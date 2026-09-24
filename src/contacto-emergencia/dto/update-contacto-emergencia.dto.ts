import { PartialType } from '@nestjs/mapped-types';
import { CreateContactoEmergenciaDto } from './create-contacto-emergencia.dto';

export class UpdateContactoEmergenciaDto extends PartialType(CreateContactoEmergenciaDto) {}
