import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonaEventosAsistenciaDto } from './create-persona_eventos_asistencia.dto';

export class UpdatePersonaEventosAsistenciaDto extends PartialType(CreatePersonaEventosAsistenciaDto) {}
