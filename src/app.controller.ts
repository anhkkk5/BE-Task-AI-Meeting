import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHealth() {
    return this.appService.getHealth();
  }

  @Get('health')
  getHealthPing() {
    return {
      status: 'ok',
      service: 'AgileFlow AI Backend',
      timestamp: new Date().toISOString(),
    };
  }
}
