import { Module } from '@nestjs/common';
import { MembresiaSeguimientoService } from './membresia-seguimiento.service';
import { MembresiaSeguimientoController } from './membresia-seguimiento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MembresiaSeguimiento } from './entities/membresia-seguimiento.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { MembresiaExtension } from 'src/membresia_extension/entities/membresia_extension.entity';
import { DetalleventaMembresia } from 'src/detalleventa_membresias/entities/detalleventa_membresia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [MembresiaSeguimientoController],
  providers: [MembresiaSeguimientoService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([MembresiaSeguimiento, Persona, Venta, MembresiaExtension, DetalleventaMembresia])],
  exports: [MembresiaSeguimientoService]
})
export class MembresiaSeguimientoModule {}
