import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Student } from '../students/entities/student.entity';
import { Company } from '../companies/entities/company.entity';
import { Teacher } from '../academic/entities/teacher.entity';
import { CompanyRepresentative } from '../companies/entities/company-representative.entity';
import { Career } from '../academic/entities/career.entity';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { UsersController } from './users.controller';
import { RolesController } from './roles.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User, 
      Role, 
      Student, 
      Company, 
      Teacher, 
      CompanyRepresentative, 
      Career
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService],
  exports: [UsersService, RolesService],
})
export class UsersModule {}