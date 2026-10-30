import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationPermiso } from './entities/notification-permiso.entity';
import { User } from 'src/user/entities/user.entity';
import { Terminologia } from 'src/terminologia/entities/terminologia.entity';
import { NotificationPermisosController } from './notification-permisos.controller';
import { NotificationPermisosService } from './notification-permisos.service';

describe('NotificationPermisosController', () => {
  let controller: NotificationPermisosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationPermisosController],
      providers: [
        NotificationPermisosService,
        { provide: getRepositoryToken(NotificationPermiso), useValue: {} },
        { provide: getRepositoryToken(User), useValue: {} },
        { provide: getRepositoryToken(Terminologia), useValue: {} },
      ],
    }).compile();

    controller = module.get<NotificationPermisosController>(NotificationPermisosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
