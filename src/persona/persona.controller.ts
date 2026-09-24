import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { PersonaService } from './persona.service';
import { CreatePersonaDto } from './dto/create-persona.dto';
import { UpdatePersonaDto } from './dto/update-persona.dto';
import { Query } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('persona')
export class PersonaController {
  constructor(private readonly personaService: PersonaService) {}

  @Post('/id_tipo/:id_tipo')
  create(@Param('id_tipo') id_tipo: number, @Body() createPersonaDto: CreatePersonaDto) {
    console.log({id_tipo});
    
    return this.personaService.create(id_tipo, createPersonaDto);
  }

  @Post('/avatar/:uid_avatar')
  @UseInterceptors(FileInterceptor('file'))
  uploadAvatar(
    @Param('uid_avatar') uid_avatar: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.personaService.uploadAvatar(uid_avatar, file);
  }

  @Get('/id_tipo/:id_tipo')
  findAll(@Param('id_tipo') id_tipo: number, @Query() paginationDto: PaginationDto) {
    return this.personaService.findAll(id_tipo, paginationDto);
  }

  @Get('/id_tipo/:id_tipo/search')
  async search(  @Query() paginationDto: PaginationDto, @Param('id_tipo') id_tipo: number){
    const { q } = paginationDto;
    const { items, total } = await this.personaService.findSearch(q as string, paginationDto, id_tipo);
    return {
      items,
      total
    };
  }

  @Get('/id_tipo/:id_tipo/search/box')
  async searchBox(@Query('q') q: string, @Param('id_tipo') id_tipo: number) {
    const { items, total } = await this.personaService.findSearchBox(q, id_tipo);
    return {
      items,
      total
    };
  }

  @Get('/id_tipo/:id_tipo/id/:id')
  findOne(@Param('id_tipo') id_tipo: number, @Param('id') id: string) {
    return this.personaService.findOne(id_tipo, +id);
  }

  @Get('/id_tipo/:id_tipo/uid/:uid')
  findOneByUid(@Param('id_tipo') id_tipo: number, @Param('uid') uid: string) {
    return this.personaService.findOneByUid(id_tipo, uid);
  }
  @Get('/combo/id_tipo')
  COMBO_findAllxIdsTipo(@Query('arrayIdTipo') arrayIdTipo: number[], @Query() paginationDto: PaginationDto) {
    const arrayIdTipoParsed = (arrayIdTipo as unknown as string).split(',').map(id => parseInt(id, 10));
    return this.personaService.COMBO_findAllxIdsTipo(arrayIdTipoParsed, paginationDto);
  }

  @Patch('/id_tipo/:id_tipo/id/:id')
  update(@Param('id_tipo') id_tipo: number, @Param('id') id: string, @Body() updatePersonaDto: UpdatePersonaDto) {
    return this.personaService.update(id_tipo, +id, updatePersonaDto);
  }

  @Delete('/id_tipo/:id_tipo/id/:id')
  remove(@Param('id_tipo') id_tipo: number, @Param('id') id: string) {
    return this.personaService.remove(id_tipo, +id);
  }
}
