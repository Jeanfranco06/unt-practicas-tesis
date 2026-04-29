import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { DashboardService } from './dashboard.service';

@Injectable()
export class DashboardRouter {
  constructor(private trpc: TrpcService, private dashboardService: DashboardService) {}

  router = this.trpc.router({
    getStats: this.trpc.protectedProcedure.query(async () => {
      return this.dashboardService.getStats();
    }),
  });
}