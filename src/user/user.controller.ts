import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata, Query, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CambiarPasswordDto } from './dto/cambiar-password.dto';
import { AsignarPasswordDto } from './dto/asignar-password.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { GetUser } from './decorator/get-user.decorator';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** Registra un usuario; quien lo registra (id_userParent) sale del token, no del body */
  @Post('register')
  @UseGuards(JwtAuthGuard)
  create(@Body() createUserDto: CreateUserDto, @GetUser('id') idUserParent: number) {
    return this.userService.create(createUserDto, idUserParent);
  }

  @Post('login')
  login(@Body() LoginUserDto: LoginUserDto) {
    return this.userService.login(LoginUserDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.userService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.userService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  /** Datos del usuario logueado (sale del token): nombre y rol para el header del Home */
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  findMe(@GetUser('id') idUser: number) {
    return this.userService.findMe(idUser);
  }

  /** El usuario logueado cambia su contraseña (con la actual); el usuario sale del token */
  @Patch('/me/password')
  @UseGuards(JwtAuthGuard)
  cambiarPassword(@GetUser('id') idUser: number, @Body() cambiarPasswordDto: CambiarPasswordDto) {
    return this.userService.cambiarPassword(idUser, cambiarPasswordDto);
  }

  /** Asigna una contraseña nueva a otro usuario: solo quien lo creó o un super usuario (lo valida el servicio) */
  @Patch('/id/:id/password')
  @UseGuards(JwtAuthGuard)
  asignarPassword(@Param('id', ParseIntPipe) id: number, @GetUser('id') idAdmin: number, @Body() asignarPasswordDto: AsignarPasswordDto) {
    return this.userService.asignarPassword(id, idAdmin, asignarPasswordDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
  // @Get('private')
  // @UseGuards(AuthGuard())
  // testingPrivateRoute(
  //   @GetUser('') user:User,
  //   @GetUser('email') userEmail:string
  // ) {
  //   return {
  //     ok: true,
  //     message: 'Hola private',
  //     user,
  //     userEmail
  //   };
  // }
  // @Get('private2')
  // @SetMetadata('roles', ['admin', 'super-user'])
  // @UseGuards(AuthGuard())
  // privateRoutes2(
  //   @GetUser() user:User
  // ) {
  //   return {
  //     ok: true,
  //     message: 'Hola private',
  //     user
  //   };
  // }
  
  // @Get('private3')
  // @SetMetadata('roles', ['admin', 'super-user'])
  // @UseGuards(AuthGuard())
  // privateRoutes3(
  //   @GetUser() user:User
  // ) {
  //   return {
  //     ok: true,
  //     message: 'Hola private',
  //     user
  //   };
  // }
}
