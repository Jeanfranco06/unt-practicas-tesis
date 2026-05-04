import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { RolesService } from './roles.service';
// DTO imports will be fixed when DTO files are properly created
// import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from './entities/role.entity';

@Controller('roles')
@UseGuards(AuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() createRoleDto: any) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findById(id);
  }

  @Get('name/:name')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findByName(@Param('name') name: RoleName) {
    return this.rolesService.findByName(name);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateRoleDto: any) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deactivate(id);
  }

  @Post('initialize')
  @Roles(RoleName.ADMIN)
  initializeDefaultRoles() {
    return this.rolesService.initializeDefaultRoles();
  }
}
