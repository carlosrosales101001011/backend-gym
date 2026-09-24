import { PartialType } from '@nestjs/mapped-types';
import { CreateMembresiaExtensionDto } from './create-membresia_extension.dto';

export class UpdateMembresiaExtensionDto extends PartialType(CreateMembresiaExtensionDto) {}
