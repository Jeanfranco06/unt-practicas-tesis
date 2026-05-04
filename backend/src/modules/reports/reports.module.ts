import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { InternshipsModule } from '../internships/internships.module';
import { ThesisModule } from '../thesis/thesis.module';
import { CompaniesModule } from '../companies/companies.module';
import { AuthModule } from '../auth/auth.module';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { AgreementsModule } from '../agreements/agreements.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Internship } from '../internships/entities/internship.entity';
import { InternshipApplication } from '../internships/entities/internship-application.entity';
import { InternshipOffer } from '../internships/entities/internship-offer.entity';
import { ThesisProject } from '../thesis/entities/thesis-project.entity';
import { ThesisAssignment } from '../thesis/entities/thesis-assignment.entity';
import { Deliverable } from '../thesis/entities/deliverable.entity';
import { DeliverableSubmission } from '../thesis/entities/deliverable-submission.entity';
import { DefenseRecord } from '../thesis/entities/defense-record.entity';
import { Agreement } from '../agreements/entities/agreement.entity';
import { Company } from '../companies/entities/company.entity';
import { Student } from '../students/entities/student.entity';
import { User } from '../users/entities/user.entity';
import { HoursTracking } from '../internships/entities/hours-tracking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Internship,
      InternshipApplication,
      InternshipOffer,
      ThesisProject,
      ThesisAssignment,
      Deliverable,
      DeliverableSubmission,
      DefenseRecord,
      Agreement,
      Company,
      Student,
      User,
      HoursTracking,
    ]),
    InternshipsModule,
    ThesisModule,
    CompaniesModule,
    AuthModule,
    StudentsModule,
    UsersModule,
    AgreementsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}