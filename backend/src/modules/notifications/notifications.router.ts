import { Injectable } from '@nestjs/common';
import { TrpcService } from '../trpc/trpc.service';
import { NotificationsService } from './notifications.service';
import { z } from 'zod';

@Injectable()
export class NotificationsRouter {
  constructor(
    private trpc: TrpcService,
    private notificationsService: NotificationsService,
  ) {}

  router = this.trpc.router({
    getMyNotifications: this.trpc.protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return this.notificationsService.findByUser(ctx.user.sub, input?.limit);
      }),

    getUnreadCount: this.trpc.protectedProcedure
      .query(async ({ ctx }) => {
        const notifications = await this.notificationsService.findByUser(ctx.user.sub);
        return notifications.filter(n => !n.leido).length;
      }),

    markAsRead: this.trpc.protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await this.notificationsService.markAsRead(input.id, true);
        return { success: true };
      }),

    archive: this.trpc.protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await this.notificationsService.archive(input.id);
        return { success: true };
      }),
  });
}
