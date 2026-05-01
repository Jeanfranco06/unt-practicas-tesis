import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('pending-advisors')
  @Roles(RolUsuario.ADMIN)
  findPendingAdvisors() {
    return this.usersService.findPendingAdvisors();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Post(':id/approve')
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string) {
    return this.usersService.approveUser(+id);
  }

  @Post(':id/reject')
  @Roles(RolUsuario.ADMIN)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string) {
    return this.usersService.rejectUser(+id);
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}