import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Put, Patch, Body, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ModuloXUserService } from './modulo-x-user.service';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { CreateModuloXUserDto } from './dto/create-modulo-x-user.dto';
import { AsignarModulosDto } from './dto/asignar-modulos.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CambiarFijadoDto } from './dto/cambiar-fijado.dto';

@Controller('modulo-x-user')
export class ModuloXUserController {
  constructor(private readonly moduloXUserService: ModuloXUserService) {}
  
  @Post('/bulk')
  @UseGuards(JwtAuthGuard)
  create(@Body() createModuloXUserDto: CreateModuloXUserDto[], @Auditor() auditor: ContextoAuditoria) {
    return this.moduloXUserService.createBulk(createModuloXUserDto, auditor);
  }
  @Get('/user/')
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser('id') iduser:number) {
    return this.moduloXUserService.findAll(iduser);
  }
  /** El usuario logueado fija / desfija uno de SUS módulos (chincheta del Home) */
  @Patch('/me/id/:id/fijado')
  @UseGuards(JwtAuthGuard)
  cambiarFijado(@Param('id', ParseIntPipe) id: number, @Auditor() auditor: ContextoAuditoria, @Body() { is_fijado }: CambiarFijadoDto) {
    return this.moduloXUserService.cambiarFijado(id, auditor, is_fijado);
  }

  @Get('/user/secciones')
  @UseGuards(JwtAuthGuard)
  findBySeccionxModuloUser(@GetUser('id') iduser:number) {
    return this.moduloXUserService.findBySeccionxModuloUser(iduser);
  }

  // Gestión de módulos por usuario: solo sobre los usuarios que puede administrar quien está logueado

  @Get('/usuarios/search')
  @UseGuards(JwtAuthGuard)
  buscarUsuarios(@GetUser('id') idAdmin: number, @Query() paginationDto: PaginationDto) {
    return this.moduloXUserService.buscarUsuarios(idAdmin, paginationDto);
  }

  @Get('/usuarios/opciones')
  @UseGuards(JwtAuthGuard)
  opcionesUsuarios(@GetUser('id') idAdmin: number) {
    return this.moduloXUserService.opcionesUsuarios(idAdmin);
  }

  @Get('/disponibles')
  @UseGuards(JwtAuthGuard)
  modulosDisponibles(@GetUser('id') idAdmin: number) {
    return this.moduloXUserService.modulosDisponibles(idAdmin);
  }

  @Get('/usuario/:id')
  @UseGuards(JwtAuthGuard)
  modulosDeUsuario(@Param('id', ParseIntPipe) idUsuario: number, @GetUser('id') idAdmin: number) {
    return this.moduloXUserService.modulosDeUsuario(idUsuario, idAdmin);
  }

  @Put('/usuario/:id')
  @UseGuards(JwtAuthGuard)
  asignarModulos(@Param('id', ParseIntPipe) idUsuario: number, @Auditor() auditor: ContextoAuditoria, @Body() asignarModulosDto: AsignarModulosDto) {
    return this.moduloXUserService.asignarModulos(idUsuario, auditor, asignarModulosDto);
  }
}
