import { PartialType } from '@nestjs/mapped-types';
import { CreatePromocionBeneficioDto } from './create-promocion-beneficio.dto';

export class UpdatePromocionBeneficioDto extends PartialType(CreatePromocionBeneficioDto) {}
