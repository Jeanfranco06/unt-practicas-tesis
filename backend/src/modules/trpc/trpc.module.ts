import { Module } from '@nestjs/common';
import { TrpcRouter } from './trpc.router';
import { TrpcService } from './trpc.service';
import { AuthModule } from '../auth/auth.module';
import { InternshipsModule } from '../internships/internships.module';
import { ThesisModule } from '../thesis/thesis.module';
import { CompaniesModule } from '../companies/companies.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [AuthModule, InternshipsModule, ThesisModule, CompaniesModule, StudentsModule, UsersModule],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcRouter],
})
export class TrpcModule {}