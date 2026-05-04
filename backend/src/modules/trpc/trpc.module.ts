import { Global, Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrpcRouter } from './trpc.router';
import { TrpcService } from './trpc.service';
import { AuthModule } from '../auth/auth.module';
import { InternshipsModule } from '../internships/internships.module';
import { ThesisModule } from '../thesis/thesis.module';
import { CompaniesModule } from '../companies/companies.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { ReportsModule } from '../reports/reports.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AcademicModule } from '../academic/academic.module';
import { Teacher } from '../academic/entities/teacher.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Teacher]),
    AuthModule,
    InternshipsModule,
    forwardRef(() => ThesisModule),
    CompaniesModule,
    StudentsModule,
    UsersModule,
    ReportsModule,
    forwardRef(() => DashboardModule),
    forwardRef(() => NotificationsModule),
    AcademicModule,
  ],
  providers: [TrpcService, TrpcRouter],
  exports: [TrpcRouter, TrpcService],
})
export class TrpcModule {}