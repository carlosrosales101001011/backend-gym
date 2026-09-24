import { Module } from '@nestjs/common';
import { PromocionBeneficioService } from './promocion-beneficio.service';
import { PromocionBeneficioController } from './promocion-beneficio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocionBeneficio } from './entities/promocion-beneficio.entity';
import { Promocion } from 'src/promocion/entities/promocion.entity';
import { Producto } from 'src/producto/entities/producto.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  controllers: [PromocionBeneficioController],
  providers: [PromocionBeneficioService, FullTextSearchService],
  imports: [TypeOrmModule.forFeature([PromocionBeneficio, Promocion, Producto, Terminologia])]
})
export class PromocionBeneficioModule {}
