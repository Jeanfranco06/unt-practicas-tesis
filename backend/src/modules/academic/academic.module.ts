import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Career } from './entities/career.entity';
import { Teacher } from './entities/teacher.entity';
import { FacultyService } from './services/faculty.service';
import { CareerService } from './services/career.service';
import { TeacherService } from './services/teacher.service';
import { FacultyController } from './controllers/faculty.controller';
import { CareerController } from './controllers/career.controller';
import { TeacherController } from './controllers/teacher.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Faculty, Career, Teacher]),
    AuthModule,
  ],
  controllers: [FacultyController, CareerController, TeacherController],
  providers: [FacultyService, CareerService, TeacherService],
  exports: [FacultyService, CareerService, TeacherService],
})
export class AcademicModule {}
