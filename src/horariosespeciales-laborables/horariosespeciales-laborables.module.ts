import { Module } from '@nestjs/common';
import { HorariosespecialesLaborablesService } from './horariosespeciales-laborables.service';
import { HorariosespecialesLaborablesController } from './horariosespeciales-laborables.controller';

@Module({
  controllers: [HorariosespecialesLaborablesController],
  providers: [HorariosespecialesLaborablesService],
})
export class HorariosespecialesLaborablesModule {}
