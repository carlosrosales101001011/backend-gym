import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationPermisoDto } from './create-notification-permiso.dto';

export class UpdateNotificationPermisoDto extends PartialType(CreateNotificationPermisoDto) {}
