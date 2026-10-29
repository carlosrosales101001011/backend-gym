import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompromisosPagoClienteService } from './compromisos-pago-cliente.service';
import { CompromisosPagoClienteController } from './compromisos-pago-cliente.controller';
import { CompromisosPagoCliente } from './entities/compromisos-pago-cliente.entity';
import { Persona } from 'src/persona/entities/persona.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { Venta } from 'src/venta/entities/venta.entity';
import { User } from 'src/user/entities/user.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [CompromisosPagoClienteController],
  providers: [CompromisosPagoClienteService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([CompromisosPagoCliente, Persona, Terminologia, Venta, User])],
})
export class CompromisosPagoClienteModule {}
