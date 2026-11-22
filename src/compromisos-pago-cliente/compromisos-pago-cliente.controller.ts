import { Auditor } from 'src/user-auditoria/decorator/auditor.decorator';
import type { ContextoAuditoria } from 'src/user-auditoria/dto/create-user-auditoria.dto';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CompromisosPagoClienteService } from './compromisos-pago-cliente.service';
import { CreateCompromisosPagoClienteDto } from './dto/create-compromisos-pago-cliente.dto';
import { UpdateCompromisosPagoClienteDto } from './dto/update-compromisos-pago-cliente.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { JwtAuthGuard } from 'src/user/guard/jwt-auth.guard';

@Controller('compromisos-pago-cliente')
export class CompromisosPagoClienteController {
  constructor(private readonly compromisosPagoClienteService: CompromisosPagoClienteService) {}

  /** El colaborador del compromiso es el del usuario logueado */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createCompromisosPagoClienteDto: CreateCompromisosPagoClienteDto, @Auditor() auditor: ContextoAuditoria) {
    return this.compromisosPagoClienteService.create(createCompromisosPagoClienteDto, auditor);
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

  @UseGuards(JwtAuthGuard)
  @Patch('/id/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCompromisosPagoClienteDto: UpdateCompromisosPagoClienteDto, @Auditor() auditor: ContextoAuditoria) {
    return this.compromisosPagoClienteService.update(id, updateCompromisosPagoClienteDto, auditor);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/id/:id')
  remove(@Param('id', ParseIntPipe) id: number, @Auditor() auditor: ContextoAuditoria) {
    return this.compromisosPagoClienteService.remove(id, auditor);
  }
}
