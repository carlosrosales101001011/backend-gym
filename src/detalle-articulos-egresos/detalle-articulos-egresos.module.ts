import { Module } from '@nestjs/common';
import { DetalleArticulosEgresosService } from './detalle-articulos-egresos.service';
import { DetalleArticulosEgresosController } from './detalle-articulos-egresos.controller';
import { DetalleArticulosEgreso } from './entities/detalle-articulos-egreso.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    TypeOrmModule.forFeature([DetalleArticulosEgreso]),
  ],
  controllers: [DetalleArticulosEgresosController],
  providers: [DetalleArticulosEgresosService],
})
export class DetalleArticulosEgresosModule {}
