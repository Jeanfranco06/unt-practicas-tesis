import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { RolesService } from './roles.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleName } from './entities/role.entity';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
  ) {}

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  async findAll(@Query() paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    return this.usersService.findAllPaginated(paginationDto);
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':id/roles/:roleId')
  @Roles(RoleName.ADMIN)
  assignRole(
    @Param('id', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.assignRole(userId, roleId);
  }

  @Delete(':id/roles/:roleId')
  @Roles(RoleName.ADMIN)
  removeRole(
    @Param('id', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.removeRole(userId, roleId);
  }

  @Get(':id/roles')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  getUserRoles(@Param('id', ParseIntPipe) userId: number) {
    return this.usersService.getUserRoles(userId);
  }

  @Post(':id/student-profile')
  @Roles(RoleName.ADMIN)
  createStudentProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() profileData: { carreraId?: number },
  ) {
    return this.usersService.createStudentProfile(userId, profileData.carreraId);
  }

  @Post(':id/teacher-profile')
  @Roles(RoleName.ADMIN)
  createTeacherProfile(
    @Param('id', ParseIntPipe) userId: number,
    @Body() profileData: { carreraId?: number; especialidad?: string },
  ) {
    return this.usersService.createTeacherProfile(
      userId,
      profileData.carreraId,
      profileData.especialidad,
    );
  }

  @Get('role/advisors')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findAdvisors() {
    return this.usersService.findByRole(RoleName.ASESOR);
  }

  @Get('role/:roleName')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  findByRole(@Param('roleName') roleName: RoleName) {
    return this.usersService.findByRole(roleName);
  }

  // Rutas específicas para cada tipo de usuario
  @Post('base')
  @Roles(RoleName.ADMIN)
  async createBaseUser(@Body() createBaseUserDto: any) {
    return this.usersService.createBaseUser(createBaseUserDto);
  }

  @Post('student')
  @Roles(RoleName.ADMIN)
  async createStudent(@Body() createStudentDto: any) {
    return this.usersService.createStudent(createStudentDto);
  }

  @Post('teacher')
  @Roles(RoleName.ADMIN)
  async createTeacher(@Body() createTeacherDto: any) {
    return this.usersService.createTeacher(createTeacherDto);
  }

  @Post('representative')
  @Roles(RoleName.ADMIN)
  async createRepresentative(@Body() createRepresentativeDto: any) {
    return this.usersService.createRepresentative(createRepresentativeDto);
  }

  @Post('admin')
  @Roles(RoleName.ADMIN)
  async createAdmin(@Body() createAdminDto: any) {
    return this.usersService.createAdmin(createAdminDto);
  }

  @Get('careers/list')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  async getCareers() {
    return this.usersService.getCareers();
  }

  @Get('companies/list')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  async getCompanies() {
    return this.usersService.getCompanies();
  }

  // Endpoints para vinculación flexible de usuarios a perfiles
  @Get('available/:profileType')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR)
  async getUsersWithoutProfile(@Param('profileType') profileType: string) {
    return this.usersService.getUsersWithoutProfile(profileType);
  }

  @Post('link/student/:userId')
  @Roles(RoleName.ADMIN)
  async linkUserToStudent(@Param('userId', ParseIntPipe) userId: number, @Body() studentData: any) {
    return this.usersService.linkUserToStudent(userId, studentData);
  }

  @Post('link/teacher/:userId')
  @Roles(RoleName.ADMIN)
  async linkUserToTeacher(@Param('userId', ParseIntPipe) userId: number, @Body() teacherData: any) {
    return this.usersService.linkUserToTeacher(userId, teacherData);
  }

  @Post('link/representative/:userId')
  @Roles(RoleName.ADMIN)
  async linkUserToRepresentative(@Param('userId', ParseIntPipe) userId: number, @Body() representativeData: any) {
    return this.usersService.linkUserToRepresentative(userId, representativeData);
  }
}