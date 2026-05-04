import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

/**
 * Guard para rate limiting simple en memoria
 * Para producción, usar Redis u otra solución distribuida
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);
    const now = Date.now();

    // Limpiar entradas expiradas
    this.cleanup(now);

    // Verificar si existe registro para esta IP
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    // Incrementar contador
    this.store[key].count++;

    // Verificar límite
    if (this.store[key].count > this.maxRequests) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Demasiados intentos. Por favor intente más tarde.',
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getKey(request: Request): string {
    // Usar IP del cliente como clave
    const ip = request.ip || 
               request.connection.remoteAddress || 
               request.socket.remoteAddress ||
               (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
               'unknown';
    return `${ip}:${request.path}`;
  }

  private cleanup(now: number): void {
    for (const key in this.store) {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    }
  }
}

/**
 * Guard específico para login (más restrictivo)
 */
@Injectable()
export class LoginRateLimitGuard extends RateLimitGuard {
  constructor() {
    // 5 intentos por minuto para login
    super(5, 60000);
  }
}
