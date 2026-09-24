import { PartialType } from '@nestjs/mapped-types';
import { CreateUbigeoDto } from './create-ubigeo.dto';

export class UpdateUbigeoDto extends PartialType(CreateUbigeoDto) {}
