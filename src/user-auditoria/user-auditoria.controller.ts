import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserAuditoriaService } from './user-auditoria.service';
import { CreateUserAuditoriaDto } from './dto/create-user-auditoria.dto';
import { UpdateUserAuditoriaDto } from './dto/update-user-auditoria.dto';

@Controller('user-auditoria')
export class UserAuditoriaController {
  constructor(private readonly userAuditoriaService: UserAuditoriaService) {}

  @Post()
  create(@Body() createUserAuditoriaDto: CreateUserAuditoriaDto) {
    return this.userAuditoriaService.create(createUserAuditoriaDto);
  }

  @Get()
  findAll() {
    return this.userAuditoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userAuditoriaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserAuditoriaDto: UpdateUserAuditoriaDto) {
    return this.userAuditoriaService.update(+id, updateUserAuditoriaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userAuditoriaService.remove(+id);
  }
}
