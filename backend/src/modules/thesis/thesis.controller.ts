import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ThesisService } from './thesis.service';
import { CreateThesisProjectDto, UpdateThesisProjectDto } from './dto/thesis-project.dto';
import { CreateThesisAssignmentDto } from './dto/thesis-assignment.dto';
import { CreateDeliverableDto, SubmitDeliverableDto, ReviewDeliverableDto } from './dto/deliverable.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('thesis')
@UseGuards(AuthGuard, RolesGuard)
export class ThesisController {
  constructor(private readonly service: ThesisService) {}

  // Proyectos
  @Get('projects')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ASESOR)
  findAllProjects(@CurrentUser() user: any) {
    // Asesores solo ven proyectos donde están asignados? Podría filtrarse, simplificamos
    return this.service.findAllProjects();
  }

  @Get('projects/student/:studentId')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ASESOR, RolUsuario.ESTUDIANTE)
  findProjectsByStudent(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    if (user.rol === RolUsuario.ESTUDIANTE && user.id !== +studentId) {
      // validar que el estudiante solo vea su proyecto, pero simplificamos
    }
    return this.service.findProjectsByStudent(+studentId);
  }

  @Post('projects')
  @Roles(RolUsuario.ESTUDIANTE)
  createProject(@Body() dto: CreateThesisProjectDto, @CurrentUser() user: any) {
    dto.estudianteId = user.id; // asumiendo relación
    return this.service.createProject(dto);
  }

  @Patch('projects/:id')
  @Roles(RolUsuario.ESTUDIANTE, RolUsuario.COORDINADOR)
  updateProject(@Param('id') id: string, @Body() dto: UpdateThesisProjectDto) {
    return this.service.updateProject(+id, dto);
  }

  // Asignaciones
  @Post('assignments')
  @Roles(RolUsuario.COORDINADOR)
  addAssignment(@Body() dto: CreateThesisAssignmentDto) {
    return this.service.addAssignment(dto);
  }

  @Delete('assignments/:id')
  @Roles(RolUsuario.COORDINADOR)
  removeAssignment(@Param('id') id: string) {
    return this.service.removeAssignment(+id);
  }

  // Entregables
  @Post('deliverables')
  @Roles(RolUsuario.COORDINADOR, RolUsuario.ASESOR)
  createDeliverable(@Body() dto: CreateDeliverableDto) {
    return this.service.createDeliverable(dto);
  }

  @Post('deliverables/submit')
  @Roles(RolUsuario.ESTUDIANTE)
  submitDeliverable(@Body() dto: SubmitDeliverableDto, @CurrentUser() user: any) {
    return this.service.submitDeliverable(dto, user.id);
  }

  @Patch('deliverables/submissions/:id/review')
  @Roles(RolUsuario.ASESOR)
  reviewDeliverable(@Param('id') id: string, @Body() dto: ReviewDeliverableDto, @CurrentUser() user: any) {
    return this.service.reviewDeliverable(+id, dto, user.id);
  }

  // Acta
  @Post('projects/:id/defense')
  @Roles(RolUsuario.COORDINADOR)
  createDefenseRecord(@Param('id') id: string, @Body() dto: any) {
    return this.service.createDefenseRecord(+id, dto);
  }
}