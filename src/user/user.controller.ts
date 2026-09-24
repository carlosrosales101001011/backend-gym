import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
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
