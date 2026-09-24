import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProgramaEntrenamientoService } from './programa_entrenamiento.service';
import { CreateProgramaEntrenamientoDto } from './dto/create-programa_entrenamiento.dto';
import { UpdateProgramaEntrenamientoDto } from './dto/update-programa_entrenamiento.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('programa-entrenamiento')
export class ProgramaEntrenamientoController {
  constructor(private readonly programaEntrenamientoService: ProgramaEntrenamientoService) {}

  @Post()
  create(@Body() createProgramaEntrenamientoDto: CreateProgramaEntrenamientoDto) {
    return this.programaEntrenamientoService.create(createProgramaEntrenamientoDto);
  }

  @Post('/avatar/:uid_avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Param('uid_avatar') uid_avatar: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.programaEntrenamientoService.uploadAvatar(uid_avatar, file);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.programaEntrenamientoService.findAll(paginationDto);
  }
  
  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.programaEntrenamientoService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.programaEntrenamientoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateProgramaEntrenamientoDto: UpdateProgramaEntrenamientoDto) {
    return this.programaEntrenamientoService.update(+id, updateProgramaEntrenamientoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.programaEntrenamientoService.remove(+id);
  }
}
