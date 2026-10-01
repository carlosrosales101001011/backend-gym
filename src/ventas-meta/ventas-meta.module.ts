import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VentasMetaService } from './ventas-meta.service';
import { VentasMetaController } from './ventas-meta.controller';
import { VentasMeta } from './entities/ventas-meta.entity';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VentasMeta]),
  ],
  controllers: [VentasMetaController],
  providers: [VentasMetaService, FullTextSearchService],
})
export class VentasMetaModule {}
