import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Agreement } from './entities/agreement.entity';
import { AgreementsService } from './agreements.service';
import { AgreementsController } from './agreements.controller';
import { CompaniesModule } from '../companies/companies.module';

@Module({
  imports: [TypeOrmModule.forFeature([Agreement]), CompaniesModule],
  controllers: [AgreementsController],
  providers: [AgreementsService],
  exports: [AgreementsService],
})
export class AgreementsModule {}