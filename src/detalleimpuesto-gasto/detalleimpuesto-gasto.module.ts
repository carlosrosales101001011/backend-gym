import { Module } from '@nestjs/common';
import { DetalleimpuestoGastoService } from './detalleimpuesto-gasto.service';
import { DetalleimpuestoGastoController } from './detalleimpuesto-gasto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetalleimpuestoGasto } from './entities/detalleimpuesto-gasto.entity';

@Module({
  controllers: [DetalleimpuestoGastoController],
  providers: [DetalleimpuestoGastoService],
  imports: [
    TypeOrmModule.forFeature([DetalleimpuestoGasto])
  ]
})
export class DetalleimpuestoGastoModule {}
