import { PartialType } from '@nestjs/mapped-types';
import { CreateTerminologiaGrupoMovimientoDto } from './create-terminologia-grupo-movimiento.dto';

export class UpdateTerminologiaGrupoMovimientoDto extends PartialType(CreateTerminologiaGrupoMovimientoDto) {}
