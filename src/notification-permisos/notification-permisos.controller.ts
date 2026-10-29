import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { NotificationPermisosService } from './notification-permisos.service';
import { CreateNotificationPermisoDto } from './dto/create-notification-permiso.dto';
import { UpdateNotificationPermisoDto } from './dto/update-notification-permiso.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('notification-permisos')
export class NotificationPermisosController {
  constructor(private readonly notificationPermisosService: NotificationPermisosService) {}

  @Post()
  create(@Body() createNotificationPermisoDto: CreateNotificationPermisoDto) {
    return this.notificationPermisosService.create(createNotificationPermisoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.notificationPermisosService.findAll(paginationDto);
  }

  /** Permisos de notificación de un usuario */
  @Get('/id_user/:id_user')
  findByIdUser(@Param('id_user', ParseIntPipe) id_user: number) {
    return this.notificationPermisosService.findByIdUser(id_user);
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notificationPermisosService.findOne(id);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateNotificationPermisoDto: UpdateNotificationPermisoDto) {
    return this.notificationPermisosService.update(id, updateNotificationPermisoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notificationPermisosService.remove(id);
  }
}
