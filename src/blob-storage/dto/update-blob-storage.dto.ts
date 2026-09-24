import { PartialType } from '@nestjs/mapped-types';
import { CreateBlobStorageDto } from './create-blob-storage.dto';

export class UpdateBlobStorageDto extends PartialType(CreateBlobStorageDto) {}
