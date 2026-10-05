import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { SeccionXModulouserService } from './seccion-x-modulouser.service';
import { CreateSeccionXModulouserDto } from './dto/create-seccion-x-modulouser.dto';
import { AsignarSeccionesDto } from './dto/asignar-secciones.dto';
import { ModuloXUserService } from 'src/modulo-x-user/modulo-x-user.service';
@Controller('seccion-x-modulouser')
export class SeccionXModulouserController {
  constructor(
    private readonly seccionXModuloService: SeccionXModulouserService,
    private readonly moduloXUserService: ModuloXUserService,
  ) {}

  /** Secciones del módulo del usuario del token, por el uid de modulo_x_user (vacío si el módulo no es suyo) */
  @Get('/user/modulo/uid/:uid_modulo')
  @UseGuards(JwtAuthGuard)
  findSeccionesxUidModulo(@Param('uid_modulo') uid_modulo: string, @GetUser('id') id_user: number) {
    return this.seccionXModuloService.findSeccionesxUidModulo(uid_modulo, id_user);
  }

  @Get('/user/modulo/:id_moduloUser')
  findSecciones(@Param('id_moduloUser') id_modulouser :number) {
    return this.seccionXModuloService.findSecciones(id_modulouser);
  }

  @Post('/bulk')
  createBulk(@Body() createSeccionXModuloUserDto: CreateSeccionXModulouserDto[]) {
    return this.seccionXModuloService.createBulk(createSeccionXModuloUserDto);
  }
  

  // Gestión de secciones por módulo de usuario: solo de los usuarios que administra quien está logueado

  @Get('/modulo-usuario/:id')
  @UseGuards(JwtAuthGuard)
  detalleSecciones(@Param('id', ParseIntPipe) idModuloUser: number, @GetUser('id') idAdmin: number) {
    return this.moduloXUserService.detalleSeccionesModuloUsuario(idModuloUser, idAdmin);
  }

  @Put('/modulo-usuario/:id')
  @UseGuards(JwtAuthGuard)
  asignarSecciones(@Param('id', ParseIntPipe) idModuloUser: number, @GetUser('id') idAdmin: number, @Body() { ids_seccion }: AsignarSeccionesDto) {
    return this.moduloXUserService.asignarSeccionesModuloUsuario(idModuloUser, idAdmin, ids_seccion);
  }
}
