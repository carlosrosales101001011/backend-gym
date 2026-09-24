import { Module } from '@nestjs/common';
import { PromocionCondicionService } from './promocion-condicion.service';
import { PromocionCondicionController } from './promocion-condicion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromocionCondicion } from './entities/promocion-condicion.entity';

@Module({
  controllers: [PromocionCondicionController],
  providers: [PromocionCondicionService],
  imports: [TypeOrmModule.forFeature([PromocionCondicion])]
})
export class PromocionCondicionModule {}
