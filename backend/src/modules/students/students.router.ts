import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { StudentsService } from './students.service';
import { z } from 'zod';

@Injectable()
export class StudentsRouter {
  constructor(private trpc: TrpcService, private studentsService: StudentsService) {}

  router = this.trpc.router({
    list: this.trpc.protectedProcedure.query(async () => {
      return this.studentsService.findAll();
    }),
    byId: this.trpc.protectedProcedure.input(z.number()).query(async ({ input }) => {
      return this.studentsService.findById(input);
    }),
  });
}