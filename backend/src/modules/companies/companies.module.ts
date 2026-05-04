import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyRepresentative } from './entities/company-representative.entity';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyRepresentativeService } from './services/company-representative.service';
import { CompanyRepresentativeController } from './controllers/company-representative.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyRepresentative]),
    forwardRef(() => AuthModule),
  ],
  controllers: [CompaniesController, CompanyRepresentativeController],
  providers: [CompaniesService, CompanyRepresentativeService],
  exports: [CompaniesService, CompanyRepresentativeService],
})
export class CompaniesModule {}