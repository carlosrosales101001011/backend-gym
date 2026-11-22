import { Controller, Get, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { UserAuditoriaService } from './user-auditoria.service';

@Controller('user-auditoria')
export class UserAuditoriaController {
  constructor(private readonly userAuditoriaService: UserAuditoriaService) {}

  /** "Mis actividades" del Topbar: las últimas 50 del usuario de la sesión; id_accion opcional (6200, 6202, 6203, 6204) */
  @Get('/mis-actividades')
  @UseGuards(JwtAuthGuard)
  misActividades(
    @GetUser('id') idUser: number,
    @Query('id_accion', new ParseIntPipe({ optional: true })) idAccion?: number,
  ) {
    return this.userAuditoriaService.misActividades(idUser, idAccion);
  }
}
