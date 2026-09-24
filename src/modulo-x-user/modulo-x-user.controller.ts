import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Headers, Header } from '@nestjs/common';
import { ModuloXUserService } from './modulo-x-user.service';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';
import { CreateModuloXUserDto } from './dto/create-modulo-x-user.dto';

@Controller('modulo-x-user')
export class ModuloXUserController {
  constructor(private readonly moduloXUserService: ModuloXUserService) {}
  
  @Post('/bulk')
  create(@Body() createModuloXUserDto: CreateModuloXUserDto[]) {
    return this.moduloXUserService.createBulk(createModuloXUserDto);
  }
  @Get('/user/')
  @UseGuards(JwtAuthGuard)
  findAll(@GetUser('id') iduser:number) {
    return this.moduloXUserService.findAll(iduser);
  }
  @Get('/user/secciones')
  @UseGuards(JwtAuthGuard)
  findBySeccionxModuloUser(@GetUser('id') iduser:number) {
    return this.moduloXUserService.findBySeccionxModuloUser(iduser);
  }
}
