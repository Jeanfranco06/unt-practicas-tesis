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
import { HealthModule } from './common/health/health.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './common/guards/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

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
        synchronize: true, // desarrollo: crea tablas automáticamente
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
    DashboardModule,
    TrpcModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}