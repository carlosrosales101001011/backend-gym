import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallemetaAsesorDto } from './create-detallemeta_asesor.dto';

export class UpdateDetallemetaAsesorDto extends PartialType(CreateDetallemetaAsesorDto) {}
