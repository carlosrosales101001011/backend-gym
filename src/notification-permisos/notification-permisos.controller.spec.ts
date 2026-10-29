import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPermisosController } from './notification-permisos.controller';
import { NotificationPermisosService } from './notification-permisos.service';

describe('NotificationPermisosController', () => {
  let controller: NotificationPermisosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPermisosController],
      providers: [NotificationPermisosService],
    }).compile();

    controller = module.get<NotificationPermisosController>(NotificationPermisosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
