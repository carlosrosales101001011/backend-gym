import { Module } from '@nestjs/common';
import { CuentasFinancierasService } from './cuentas-financieras.service';
import { CuentasFinancierasController } from './cuentas-financieras.controller';
import { CuentasFinanciera } from './entities/cuentas-financiera.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FullTextSearchService } from 'src/common/FullTextSearchService.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([CuentasFinanciera, Terminologia]),
  ],
  controllers: [CuentasFinancierasController],
  providers: [CuentasFinancierasService, FullTextSearchService],
})
export class CuentasFinancierasModule {}
