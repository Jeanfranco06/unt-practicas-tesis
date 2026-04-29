import { Controller, Get, Patch, Param, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  getUserNotifications(@CurrentUser() user: any) {
    return this.service.findByUser(user.sub);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.service.markAsRead(+id, true);
  }
}