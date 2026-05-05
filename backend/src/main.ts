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
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Configuración de CORS más específica
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
  ];
  
  if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-refresh-token'],
  });
  
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  
  // Body parser
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ 
    limit: '10mb', 
    extended: true,
    parameterLimit: 1000,
  }));

  // Crear directorio uploads si no existe (nota: sin la 's' final para coincidir con multer)
  const uploadsDir = path.join(process.cwd(), 'upload', 'convenios');
  const cvUploadsDir = path.join(process.cwd(), 'upload', 'cv');
  
  console.log('📁 Directorio uploads:', uploadsDir);
  try {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Directorio uploads creado');
    } else {
      console.log('✅ Directorio uploads ya existe');
    }
  } catch (err) {
    console.warn('⚠️  No se pudo crear directorio uploads:', (err as Error).message);
    console.log('   (Usando directorio en /tmp)');
  }
  
  console.log('📁 Directorio CV uploads:', cvUploadsDir);
  try {
    if (!fs.existsSync(cvUploadsDir)) {
      fs.mkdirSync(cvUploadsDir, { recursive: true });
      console.log('✅ Directorio CV uploads creado');
    } else {
      console.log('✅ Directorio CV uploads ya existe');
    }
  } catch (err) {
    console.warn('⚠️  No se pudo crear directorio CV uploads:', (err as Error).message);
    console.log('   (Usando directorio en /tmp)');
  }

  // Servir archivos estáticos desde upload/ (nota: sin la 's' final)
  const staticDir = path.join(process.cwd(), 'upload');
  console.log('📂 Sirviendo archivos estáticos desde:', staticDir);
  app.use('/uploads', express.static(staticDir));
  
  // Configurar tRPC - endpoint en /api/trpc para coherencia con el prefix global
  const trpcRouter = app.get(TrpcRouter).getRouter();
  const jwtService = app.get(JwtService);
  
  app.use('/api/trpc', createExpressMiddleware({ 
    router: trpcRouter, 
    createContext: (opts) => createContext(opts, jwtService),
    onError: ({ error, type, path, input, ctx, req }) => {
      console.error('tRPC Error:', error);
    },
  }));
  

  
  const port = Number(process.env.PORT) || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
    console.log(`📡 tRPC endpoint: http://localhost:${port}/api/trpc`);
  
}
bootstrap();