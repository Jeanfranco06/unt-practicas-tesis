import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
import { TeacherService } from '../services/teacher.service';
// import { CreateTeacherDto, UpdateTeacherDto } from '../dto/teacher.dto';
import { AuthGuard } from '../../../common/guards/auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RoleName } from '../../users/entities/role.entity';

@Controller('teachers')
@UseGuards(AuthGuard, RolesGuard)
export class TeacherController {
  constructor(private readonly teacherService: TeacherService) {}

  @Post()
  @Roles(RoleName.ADMIN)
  create(@Body() createTeacherDto: any) {
    return this.teacherService.create(createTeacherDto);
  }

  @Get()
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findAll() {
    return this.teacherService.findAll();
  }

  @Get(':id')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.findById(id);
  }

  @Get('career/:careerId')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findByCareer(@Param('careerId', ParseIntPipe) careerId: number) {
    return this.teacherService.findByCareer(careerId);
  }

  @Get('user/:userId')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.teacherService.findByUser(userId);
  }

  @Get('specialty/:specialty')
  @Roles(RoleName.ADMIN, RoleName.COORDINADOR, RoleName.ASESOR)
  findBySpecialty(@Param('specialty') specialty: string) {
    return this.teacherService.findBySpecialty(specialty);
  }

  @Patch(':id')
  @Roles(RoleName.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateTeacherDto: any) {
    return this.teacherService.update(id, updateTeacherDto);
  }

  @Delete(':id')
  @Roles(RoleName.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.teacherService.remove(id);
  }
}
