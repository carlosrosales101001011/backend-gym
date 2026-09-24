import { Controller, Get, UseGuards, Param, Post, Body } from '@nestjs/common';
import { EntidadXUserService } from './entidad-x-user.service';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { CreateEntidadXUserDto } from './dto/create-entidad-x-user.dto';

@Controller('entidad-x-user')
export class EntidadXUserController {
  constructor(private readonly entidadXUserService: EntidadXUserService) {}

  
  @Post('/bulk')
  create(@Body() createEntidadXUserDto: CreateEntidadXUserDto[]) {
    return this.entidadXUserService.createBulk(createEntidadXUserDto);
  }

  @Get('/user/')
  @UseGuards(JwtAuthGuard)
  findxIduser(@GetUser('id') iduser:number) {
    return this.entidadXUserService.findxIduser(iduser);
  }

  @Get('/user/acciones-estados/:id_acciones_estados')
  @UseGuards(JwtAuthGuard)
  findxIduserAndIdEstado(@GetUser('id') iduser:number, @Param('id_acciones_estados') idAccionesEstados:number) {
    return this.entidadXUserService.findxIduserAndIdEstado(iduser, idAccionesEstados);
  }
  @Get('/user/all')
  @UseGuards(JwtAuthGuard)
  findAllxIduser(@GetUser('id') iduser:number) {
    return this.entidadXUserService.findAllxIduser(iduser);
  }
}
