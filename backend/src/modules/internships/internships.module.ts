import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InternshipOffer } from './entities/internship-offer.entity';
import { InternshipApplication } from './entities/internship-application.entity';
import { Internship } from './entities/internship.entity';
import { HoursTracking } from './entities/hours-tracking.entity';
import { InternshipReport } from './entities/internship-report.entity';
import { FinalEvaluation } from './entities/final-evaluation.entity';
import { InternshipsService } from './internships.service';
import { InternshipsController } from './internships.controller';
import { CompaniesModule } from '../companies/companies.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InternshipOffer,
      InternshipApplication,
      Internship,
      HoursTracking,
      InternshipReport,
      FinalEvaluation,
    ]),
    CompaniesModule,
    StudentsModule,
    UsersModule,
  ],
  controllers: [InternshipsController],
  providers: [InternshipsService],
  exports: [InternshipsService],
})
export class InternshipsModule {}