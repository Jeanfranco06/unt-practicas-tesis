import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StudentsModule } from './modules/students/students.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { InternshipsModule } from './modules/internships/internships.module';
import { ThesisModule } from './modules/thesis/thesis.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';
import { TrpcModule } from './modules/trpc/trpc.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false, // usar migraciones
        logging: true,
      }),
    }),
    AuthModule,
    UsersModule,
    StudentsModule,
    CompaniesModule,
    AgreementsModule,
    InternshipsModule,
    ThesisModule,
    NotificationsModule,
    ReportsModule,
    TrpcModule,
  ],
})
export class AppModule {}