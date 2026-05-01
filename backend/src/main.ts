import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TrpcRouter } from './modules/trpc/trpc.router';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createContext } from './modules/trpc/context';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { seed } from './seeds/seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);
  app.enableCors({ origin: allowedOrigins, credentials: true });
  // dentro de bootstrap:
  const trpcRouter = app.get(TrpcRouter).getRouter();
  const jwtService = app.get(JwtService);
  app.use('/api/trpc', createExpressMiddleware({ router: trpcRouter, createContext: (opts) => createContext(opts, jwtService) }));
  const port = Number(process.env.PORT) || 4000;
  await app.listen(port);

  // Ejecutar seed
  const dataSource = app.get(DataSource);
  await seed(dataSource);
  console.log('✓ Seed completado');
}
bootstrap();