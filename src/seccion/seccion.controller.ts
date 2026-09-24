import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SeccionService } from './seccion.service';
import { CreateSeccionDto } from './dto/create-seccion.dto';
import { UpdateSeccionDto } from './dto/update-seccion.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
@Controller('seccion')
export class SeccionController {
  constructor(private readonly seccionService: SeccionService) {}

  @Post()
  create(@Body() createSeccionDto: CreateSeccionDto) {
    return this.seccionService.create(createSeccionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.seccionService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.seccionService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.seccionService.findOne(+id);
  }


  @Patch('/:id')
  update(@Param('id') id: string, @Body() updateSeccionDto: UpdateSeccionDto) {
    return this.seccionService.update(+id, updateSeccionDto);
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.seccionService.remove(+id);
  }
}
