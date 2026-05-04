import { Controller, Get, Patch, Delete, Param, UseGuards, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  getUserNotifications(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.service.findByUser(user.sub, limit ? +limit : undefined);
  }

  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return this.service.getUnreadCount(user.sub);
  }

  @Get('archived')
  getArchivedNotifications(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.service.findArchived(user.sub, limit ? +limit : undefined);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(+id, true);
  }

  @Patch(':id/unread')
  markAsUnread(@Param('id') id: string) {
    return this.service.markAsUnread(+id);
  }

  @Patch(':id/archive')
  archive(@Param('id') id: string) {
    return this.service.archive(+id);
  }

  @Patch(':id/unarchive')
  unarchive(@Param('id') id: string) {
    return this.service.unarchive(+id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }
}