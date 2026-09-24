import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PromocionService } from './promocion.service';
import { CreatePromocionDto } from './dto/create-promocion.dto';
import { UpdatePromocionDto } from './dto/update-promocion.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('promocion')
export class PromocionController {
  constructor(private readonly promocionService: PromocionService) {}

  @Post()
  create(@Body() createPromocionDto: CreatePromocionDto) {
    return this.promocionService.create(createPromocionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.promocionService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.promocionService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }
  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.promocionService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updatePromocionDto: UpdatePromocionDto) {
    return this.promocionService.update(+id, updatePromocionDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.promocionService.remove(+id);
  }
}
