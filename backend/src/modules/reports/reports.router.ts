import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { ReportsService } from './reports.service';

@Injectable()
export class ReportsRouter {
  constructor(private trpc: TrpcService, private reportsService: ReportsService) {}

  router = this.trpc.router({
    getInternshipData: this.trpc.protectedProcedure.query(async () => {
      return this.reportsService.collectInternshipData({});
    }),
    getThesisData: this.trpc.protectedProcedure.query(async () => {
      return this.reportsService.collectThesisData({});
    }),
  });
}