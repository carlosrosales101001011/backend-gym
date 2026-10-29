import { Test, TestingModule } from '@nestjs/testing';
import { NotificationPermisosService } from './notification-permisos.service';

describe('NotificationPermisosService', () => {
  let service: NotificationPermisosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationPermisosService],
    }).compile();

    service = module.get<NotificationPermisosService>(NotificationPermisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
