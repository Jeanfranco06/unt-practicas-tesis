import { inferAsyncReturnType } from '@trpc/server';
import { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { JwtService } from '@nestjs/jwt';

export async function createContext({ req }: CreateExpressContextOptions, jwtService: JwtService) {
  let user = null;
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      user = await jwtService.verifyAsync(token, { secret: process.env.JWT_SECRET });
    } catch {}
  }
  return { req, user, jwtService };
}
export type Context = inferAsyncReturnType<typeof createContext>;