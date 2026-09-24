import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { TerminologiaService } from './terminologia.service';
import { CreateTerminologiaDto } from './dto/create-terminologia.dto';
import { UpdateTerminologiaDto } from './dto/update-terminologia.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('terminologia')
export class TerminologiaController {
  constructor(private readonly terminologiaService: TerminologiaService) {}

  @Post()
  create(@Body() createTerminologiaDto: CreateTerminologiaDto) {
    return this.terminologiaService.create(createTerminologiaDto);
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.terminologiaService.findAll()
  }
  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.terminologiaService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }
  @Get('/entidad/:entidad/grupo/:grupo/subgrupo/:subgrupo')
  findAllbyEntidadGrupoAndSubGrupo(@Param('entidad') entidad:string, @Param('grupo') grupo:string, @Param('subgrupo') subgrupo:string) {
    return this.terminologiaService.findAllbyEntidadGrupoAndSubGrupo(entidad, grupo, subgrupo);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.terminologiaService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateTerminologiaDto: UpdateTerminologiaDto) {
    return this.terminologiaService.update(+id, updateTerminologiaDto);
  }

  @Patch('/delete/id/:id')
  remove(@Param('id') id: string) {
    return this.terminologiaService.remove(+id);
  }
}
