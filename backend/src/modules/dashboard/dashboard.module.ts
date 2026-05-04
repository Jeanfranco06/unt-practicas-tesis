import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardRouter } from './dashboard.router';
import { InternshipsModule } from '../internships/internships.module';
import { ThesisModule } from '../thesis/thesis.module';
import { CompaniesModule } from '../companies/companies.module';
import { StudentsModule } from '../students/students.module';
import { AgreementsModule } from '../agreements/agreements.module';

@Module({
  imports: [InternshipsModule, ThesisModule, CompaniesModule, StudentsModule, AgreementsModule],
  providers: [DashboardService, DashboardRouter],
  exports: [DashboardRouter],
})
export class DashboardModule {}