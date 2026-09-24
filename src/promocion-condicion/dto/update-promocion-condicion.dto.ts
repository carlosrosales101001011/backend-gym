import { PartialType } from '@nestjs/mapped-types';
import { CreatePromocionCondicionDto } from './create-promocion-condicion.dto';

export class UpdatePromocionCondicionDto extends PartialType(CreatePromocionCondicionDto) {}
