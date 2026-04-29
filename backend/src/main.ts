import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
// Agregar al final de bootstrap() antes de app.listen
import { TrpcRouter } from './modules/trpc/trpc.router';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { createContext } from './modules/trpc/context';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.enableCors({ origin: process.env.FRONTEND_URL, credentials: true });
  // dentro de bootstrap:
  const trpcRouter = app.get(TrpcRouter).getRouter();
  const jwtService = app.get(JwtService);
  app.use('/trpc', createExpressMiddleware({ router: trpcRouter, createContext: (opts) => createContext(opts, jwtService) }));
  await app.listen(4000);
}
bootstrap();