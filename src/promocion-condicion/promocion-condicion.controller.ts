import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PromocionCondicionService } from './promocion-condicion.service';
import { CreatePromocionCondicionDto } from './dto/create-promocion-condicion.dto';
import { UpdatePromocionCondicionDto } from './dto/update-promocion-condicion.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('promocion-condicion')
export class PromocionCondicionController {
  constructor(private readonly promocionesCondicionalService: PromocionCondicionService) {}

  @Post()
  create(@Body() createPromocionesCondicionalDto: CreatePromocionCondicionDto) {
    return this.promocionesCondicionalService.create(createPromocionesCondicionalDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.promocionesCondicionalService.findAll(paginationDto);
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.promocionesCondicionalService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updatePromocionesCondicionalDto: UpdatePromocionCondicionDto) {
    return this.promocionesCondicionalService.update(+id, updatePromocionesCondicionalDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.promocionesCondicionalService.remove(+id);
  }
}
