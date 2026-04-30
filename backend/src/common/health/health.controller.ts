import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    const dbConnected = await this.healthService.checkDatabase();
    return {
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
    };
  }
}
