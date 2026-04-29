import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThesisProject } from './entities/thesis-project.entity';
import { ThesisAssignment } from './entities/thesis-assignment.entity';
import { Deliverable } from './entities/deliverable.entity';
import { DeliverableSubmission } from './entities/deliverable-submission.entity';
import { DefenseRecord } from './entities/defense-record.entity';
import { ThesisService } from './thesis.service';
import { ThesisController } from './thesis.controller';
import { StudentsModule } from '../students/students.module';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThesisProject, ThesisAssignment, Deliverable, DeliverableSubmission, DefenseRecord]),
    StudentsModule,
    UsersModule,
    NotificationsModule,
  ],
  controllers: [ThesisController],
  providers: [ThesisService],
  exports: [ThesisService],
})
export class ThesisModule {}