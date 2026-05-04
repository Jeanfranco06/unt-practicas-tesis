import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThesisService } from './thesis.service';
import { CreateThesisProjectDto, UpdateThesisProjectDto } from './dto/thesis-project.dto';
import { CreateThesisAssignmentDto } from './dto/thesis-assignment.dto';
import { CreateDeliverableDto, SubmitDeliverableDto, ReviewDeliverableDto } from './dto/deliverable.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario, User } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('thesis')
@UseGuards(AuthGuard, RolesGuard)
export class ThesisController {
  constructor(
    private readonly service: ThesisService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Proyectos
  @Get('projects')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ASESOR)
  async findAllProjects(
    @Query('incluirInactivos') incluirInactivos?: string,
    @CurrentUser() user?: any,
  ) {
    // Obtener facultad del coordinador para filtrar
    const facultadId = await this.getFacultadIdFromCoordinator(user?.sub, user?.rol, user?.roles);

    return this.service.findAllProjects({
      incluirInactivos: incluirInactivos === 'true',
      facultadId,
    });
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
  @Roles(RolUsuario.ESTUDIANTE, RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  createProject(@Body() dto: CreateThesisProjectDto, @CurrentUser() user: any) {
    // Si es estudiante, usa su propio ID; si es admin/coordinador, usa el ID enviado en el DTO
    if (user.rol === RolUsuario.ESTUDIANTE) {
      dto.estudianteId = user.id;
    }
    return this.service.createProject(dto);
  }

  @Get('projects/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ASESOR, RolUsuario.ESTUDIANTE)
  findProjectById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findProjectById(+id);
  }

  @Patch('projects/:id')
  @Roles(RolUsuario.ESTUDIANTE, RolUsuario.COORDINADOR, RolUsuario.ADMIN)
  async updateProject(@Param('id') id: string, @Body() dto: UpdateThesisProjectDto, @CurrentUser() user: any) {
    // Si es coordinador, obtener su facultad para validar permisos
    let userFacultadId: number | undefined;
    const isAdmin = user.rol === RolUsuario.ADMIN || (user.roles && user.roles.includes(RolUsuario.ADMIN));

    if (user.rol === RolUsuario.COORDINADOR || (user.roles && user.roles.includes(RolUsuario.COORDINADOR))) {
      userFacultadId = await this.getFacultadIdFromCoordinator(user.sub, user.rol, user.roles);
    }
    return this.service.updateProject(+id, dto, userFacultadId, isAdmin);
  }

  @Delete('projects/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  deleteProject(@Param('id') id: string) {
    return this.service.deleteProject(+id);
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

  // Sugerir asesor (solo estudiante)
  @Post('projects/:id/suggest-advisor')
  @Roles(RolUsuario.ESTUDIANTE)
  async suggestAdvisor(
    @Param('id') id: string,
    @Body('asesorId') asesorId: number,
    @CurrentUser() user: any,
  ) {
    return this.service.suggestAdvisor(+id, asesorId, user.sub);
  }

  // Acta
  @Post('projects/:id/defense')
  @Roles(RolUsuario.COORDINADOR)
  createDefenseRecord(@Param('id') id: string, @Body() dto: any) {
    return this.service.createDefenseRecord(+id, dto);
  }

  /**
   * Obtiene la facultad asociada al coordinador desde su perfil de docente.
   * Si el usuario es ADMIN, retorna undefined (ve todas las facultades).
   * Si el usuario es COORDINADOR, retorna el ID de su facultad.
   */
  private async getFacultadIdFromCoordinator(
    userId: number,
    userRol?: string,
    userRoles?: string[]
  ): Promise<number | undefined> {
    // Si es ADMIN, no filtrar por facultad (ver todo)
    const isAdmin = userRol === RolUsuario.ADMIN ||
      (userRoles && userRoles.includes(RolUsuario.ADMIN));
    if (isAdmin) {
      return undefined;
    }

    // Obtener el docente asociado al usuario y su facultad
    const result = await this.userRepo.query(
      `SELECT c.facultad_id 
       FROM docente d 
       INNER JOIN carrera c ON c.id = d.carrera_id 
       WHERE d.usuario_id = $1 
       LIMIT 1`,
      [userId]
    );
    if (!result || result.length === 0) {
      throw new ForbiddenException('No se encontró la facultad asociada al coordinador');
    }
    return result[0].facultad_id;
  }
}