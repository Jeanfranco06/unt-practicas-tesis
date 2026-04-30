import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  async checkDatabase(): Promise<boolean> {
    return this.dataSource.isInitialized && this.dataSource.isConnected;
  }
}
