import { Module } from '@nestjs/common';
import { MarcacionService } from './marcacion.service';
import { MarcacionController } from './marcacion.controller';

@Module({
  controllers: [MarcacionController],
  providers: [MarcacionService],
})
export class MarcacionModule {}
