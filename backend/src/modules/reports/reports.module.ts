import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { InternshipsModule } from '../internships/internships.module';
import { ThesisModule } from '../thesis/thesis.module';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [InternshipsModule, ThesisModule, CompaniesModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}