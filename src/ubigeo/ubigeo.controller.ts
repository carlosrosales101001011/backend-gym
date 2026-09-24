import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UbigeoService } from './ubigeo.service';
import { CreateUbigeoDto } from './dto/create-ubigeo.dto';
import { UpdateUbigeoDto } from './dto/update-ubigeo.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('ubigeo')
export class UbigeoController {
  constructor(private readonly ubigeoService: UbigeoService) {}

  @Post()
  create(@Body() createUbigeoDto: CreateUbigeoDto) {
    return this.ubigeoService.create(createUbigeoDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.ubigeoService.findAll(paginationDto);
  }

  @Get('/prov/:provName')
  findProv(@Param('provName') provName:string) {
    return this.ubigeoService.findProv(provName)
  }

  @Get('/search')
  async search(@Query() paginationDto: PaginationDto) {
    const { q } = paginationDto;
    const { items, total } = await this.ubigeoService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.ubigeoService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateUbigeoDto: UpdateUbigeoDto) {
    return this.ubigeoService.update(+id, updateUbigeoDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.ubigeoService.remove(+id);
  }
}
