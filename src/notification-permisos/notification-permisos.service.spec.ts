import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationPermiso } from './entities/notification-permiso.entity';
import { User } from 'src/user/entities/user.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { NotificationPermisosService } from './notification-permisos.service';

describe('NotificationPermisosService', () => {
  let service: NotificationPermisosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationPermisosService,
        { provide: getRepositoryToken(NotificationPermiso), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Terminologia), useValue: {} },
      ],
    }).compile();

    service = module.get<NotificationPermisosService>(NotificationPermisosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
