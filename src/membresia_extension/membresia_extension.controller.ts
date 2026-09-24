import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MembresiaExtensionService } from './membresia_extension.service';
import { CreateMembresiaExtensionDto } from './dto/create-membresia_extension.dto';
import { UpdateMembresiaExtensionDto } from './dto/update-membresia_extension.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('membresia-extension')
export class MembresiaExtensionController {
  constructor(private readonly membresiaExtensionService: MembresiaExtensionService) {}

  @Post()
  create(@Body() createMembresiaExtensionDto: CreateMembresiaExtensionDto) {
    return this.membresiaExtensionService.create(createMembresiaExtensionDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.membresiaExtensionService.findAll(paginationDto);
  }

  @Get('/search')
  async search(  @Query() paginationDto: PaginationDto){
    const { q } = paginationDto;
    const { items, total } = await this.membresiaExtensionService.findSearch(q as string, paginationDto);
    return {
      items,
      total
    };
  }

  @Get('/id/:id')
  findOne(@Param('id') id: string) {
    return this.membresiaExtensionService.findOne(+id);
  }

  @Patch('/id/:id')
  update(@Param('id') id: string, @Body() updateMembresiaExtensionDto: UpdateMembresiaExtensionDto) {
    return this.membresiaExtensionService.update(+id, updateMembresiaExtensionDto);
  }

  @Delete('/id/:id')
  remove(@Param('id') id: string) {
    return this.membresiaExtensionService.remove(+id);
  }
}
