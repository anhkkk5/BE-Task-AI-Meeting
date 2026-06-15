import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: jest.fn().mockResolvedValue({
              success: true,
              message: 'API is running',
              data: {
                service: 'agile-ai-backend',
                mysql: 'connected',
                mongodb: 'connected',
                redis: 'connected',
              },
            }),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return health response', async () => {
      await expect(appController.getHealth()).resolves.toEqual({
        success: true,
        message: 'API is running',
        data: {
          service: 'agile-ai-backend',
          mysql: 'connected',
          mongodb: 'connected',
          redis: 'connected',
        },
      });
    });
  });
});
