import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { CompaniesService } from './companies.service';
import { z } from 'zod';

@Injectable()
export class CompaniesRouter {
  constructor(private trpc: TrpcService, private companiesService: CompaniesService) {}

  router = this.trpc.router({
    list: this.trpc.protectedProcedure.query(() => this.companiesService.findAll()),
    byId: this.trpc.protectedProcedure.input(z.number()).query(({ input }) => this.companiesService.findById(input)),
  });
}