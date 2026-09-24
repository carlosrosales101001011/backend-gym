import { Module } from '@nestjs/common';
import { DetallepagoGastoService } from './detallepago-gasto.service';
import { DetallepagoGastoController } from './detallepago-gasto.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetallepagoGasto } from './entities/detallepago-gasto.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DetallepagoGasto]),
  ],
  controllers: [DetallepagoGastoController],
  providers: [DetallepagoGastoService],
})
export class DetallepagoGastoModule {}
