import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TerminologiaGastoService } from './terminologia-gasto.service';
import { CreateTerminologiaGastoDto } from './dto/create-terminologia-gasto.dto';
import { UpdateTerminologiaGastoDto } from './dto/update-terminologia-gasto.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('terminologia-gasto')
export class TerminologiaGastoController {
  constructor(private readonly terminologiaGastoService: TerminologiaGastoService) {}

  @Post()
  create(@Body() createTerminologiaGastoDto: CreateTerminologiaGastoDto) {
    return this.terminologiaGastoService.create(createTerminologiaGastoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.terminologiaGastoService.findAll(paginationDto);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.terminologiaGastoService.findOne(+id);
  }
  
  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.terminologiaGastoService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id_grupo/:id_grupo')
  findAllByIdGrupo(@Param('id_grupo') id_grupo: string) {
    return this.terminologiaGastoService.findAllByIdGrupo(+id_grupo);
  }


  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateTerminologiaGastoDto: UpdateTerminologiaGastoDto) {
    return this.terminologiaGastoService.update(+id, updateTerminologiaGastoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.terminologiaGastoService.remove(+id);
  }
}
