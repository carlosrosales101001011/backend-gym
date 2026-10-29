import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CompromisosPagoClienteService } from './compromisos-pago-cliente.service';
import { CreateCompromisosPagoClienteDto } from './dto/create-compromisos-pago-cliente.dto';
import { UpdateCompromisosPagoClienteDto } from './dto/update-compromisos-pago-cliente.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';
import { GetUser } from 'src/user/decorator/get-user.decorator';

@Controller('compromisos-pago-cliente')
export class CompromisosPagoClienteController {
  constructor(private readonly compromisosPagoClienteService: CompromisosPagoClienteService) {}

  /** El colaborador del compromiso es el del usuario logueado */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCompromisosPagoClienteDto: CreateCompromisosPagoClienteDto, @GetUser('id') idUser: number) {
    return this.compromisosPagoClienteService.create(createCompromisosPagoClienteDto, idUser);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.compromisosPagoClienteService.findAll(paginationDto);
  }

  @Get('/search')
  search(@Query() paginationDto: PaginationDto) {
    return this.compromisosPagoClienteService.findSearch(paginationDto.q ?? '', paginationDto);
  }

  @Get('/id/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.compromisosPagoClienteService.findOne(id);
  }

  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCompromisosPagoClienteDto: UpdateCompromisosPagoClienteDto) {
    return this.compromisosPagoClienteService.update(id, updateCompromisosPagoClienteDto);
  }

  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.compromisosPagoClienteService.remove(id);
  }
}
