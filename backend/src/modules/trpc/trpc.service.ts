import { Injectable } from '@nestjs/common';
import { TRPCError, initTRPC } from '@trpc/server';
import { Context } from './context';

@Injectable()
export class TrpcService {
  public trpc = initTRPC.context<Context>().create();

  public procedure = this.trpc.procedure;
  public protectedProcedure = this.trpc.procedure.use(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED' });
    return next({ ctx: { user: ctx.user } });
  });
  public router = this.trpc.router;
  public mergeRouters = this.trpc.mergeRouters;
}