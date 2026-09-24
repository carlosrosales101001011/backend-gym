import { Module } from '@nestjs/common';
import { CentroCostoService } from './centro-costo.service';
import { CentroCostoController } from './centro-costo.controller';

@Module({
  controllers: [CentroCostoController],
  providers: [CentroCostoService],
})
export class CentroCostoModule {}
