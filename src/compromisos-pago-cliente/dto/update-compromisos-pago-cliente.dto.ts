import { PartialType } from '@nestjs/mapped-types';
import { CreateCompromisosPagoClienteDto } from './create-compromisos-pago-cliente.dto';

export class UpdateCompromisosPagoClienteDto extends PartialType(CreateCompromisosPagoClienteDto) {}
