import { Controller, Get, Post, Body, Patch, Delete, Param, Query, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InternshipsService } from './internships.service';
import { StudentsService } from '../students/students.service';
import { CreateInternshipOfferDto, UpdateInternshipOfferDto } from './dto/internship-offer.dto';
import { CreateApplicationDto, ReviewApplicationDto } from './dto/application.dto';
import { CreateHoursTrackingDto } from './dto/hours-tracking.dto';
import { CreateInternshipReportDto } from './dto/internship-report.dto';
import { CompanyRepresentativeService } from '../companies/services/company-representative.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario, User } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OfertaEstado } from './entities/internship-offer.entity';
import { ApplicationEstado } from './entities/internship-application.entity';

@Controller('internships')
@UseGuards(AuthGuard, RolesGuard)
export class InternshipsController {
  constructor(
    private readonly service: InternshipsService,
    private readonly studentsService: StudentsService,
    private readonly companyRepresentativeService: CompanyRepresentativeService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  // Ofertas
  @Get('offers')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ESTUDIANTE, RolUsuario.REPRESENTANTE_EMPRESA)
  async findAllOffers(
    @CurrentUser() user: any,
    @Query('estado') estado?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    if (user.rol === RolUsuario.ESTUDIANTE || (user.roles && user.roles.includes(RolUsuario.ESTUDIANTE))) {
      // Estudiantes solo ven ofertas publicadas
      return this.service.findAllOffers({ estado: OfertaEstado.PUBLICADA }, pageNum, limitNum);
    }
    
    const filters: any = {};
    const isRepresentante = user.rol === RolUsuario.REPRESENTANTE_EMPRESA ||
      (user.roles && user.roles.includes(RolUsuario.REPRESENTANTE_EMPRESA));
    if (isRepresentante) {
      const rep = await this.companyRepresentativeService.findByUser(user.sub || user.id);
      if (rep) {
        filters.empresaId = rep.empresaId;
      }
    }
    // Si se pasa un estado específico, usarlo; 'todas' significa sin filtro de estado
    if (estado && estado !== 'todas') {
      filters.estado = estado as OfertaEstado;
    }
    // Si estado es 'todas' o undefined, no filtrar por estado (incluye canceladas)
    
    return this.service.findAllOffers(filters, pageNum, limitNum);
  }

  @Post('offers')
  @Roles(RolUsuario.ADMIN, RolUsuario.REPRESENTANTE_EMPRESA)
  createOffer(@Body() dto: CreateInternshipOfferDto) {
    return this.service.createOffer(dto);
  }

  @Get('offers/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ESTUDIANTE, RolUsuario.REPRESENTANTE_EMPRESA)
  findOfferById(@Param('id') id: string) {
    return this.service.findOfferById(+id);
  }

  @Patch('offers/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.REPRESENTANTE_EMPRESA)
  updateOffer(@Param('id') id: string, @Body() dto: UpdateInternshipOfferDto) {
    return this.service.updateOffer(+id, dto);
  }

  @Patch('offers/:id/publish')
  @Roles(RolUsuario.ADMIN, RolUsuario.REPRESENTANTE_EMPRESA)
  publishOffer(@Param('id') id: string) {
    return this.service.publishOffer(+id);
  }

  @Delete('offers/:id')
  @Roles(RolUsuario.ADMIN, RolUsuario.REPRESENTANTE_EMPRESA)
  deleteOffer(@Param('id') id: string) {
    return this.service.deleteOffer(+id);
  }

  // Postulaciones
  @Post('applications')
  @Roles(RolUsuario.ESTUDIANTE)
  async apply(@Body() dto: CreateApplicationDto, @CurrentUser() user: any) {
    const student = await this.studentsService.findByUsuarioId(user.sub);
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    dto.estudianteId = student.id;
    return this.service.apply(dto);
  }

  @Get('pending-applications')
  @Roles(RolUsuario.COORDINADOR, RolUsuario.ADMIN)
  async getPendingApplications(@CurrentUser() user: any) {
    const facultadId = await this.getFacultadIdFromCoordinator(user.sub, user.rol, user.roles);
    return this.service.getPendingApplications(facultadId);
  }

  @Patch('applications/:id/review')
  @Roles(RolUsuario.COORDINADOR)
  reviewApplication(@Param('id') id: string, @Body() reviewDto: ReviewApplicationDto, @CurrentUser() user: any) {
    return this.service.reviewApplication(+id, reviewDto, user.sub);
  }

  // Prácticas
  @Get('pending-internships')
  @Roles(RolUsuario.COORDINADOR, RolUsuario.ADMIN)
  async getPendingInternships(@CurrentUser() user: any) {
    const facultadId = await this.getFacultadIdFromCoordinator(user.sub, user.rol, user.roles);
    return this.service.getPendingInternships(facultadId);
  }

  @Get('internships')
  @Roles(RolUsuario.COORDINADOR, RolUsuario.ADMIN)
  async getAllInternships(@CurrentUser() user: any) {
    const facultadId = await this.getFacultadIdFromCoordinator(user.sub, user.rol, user.roles);
    return this.service.findAllInternshipsWithAdvisor(facultadId);
  }

  @Patch('internship/:id/assign-advisor/:advisorId')
  @Roles(RolUsuario.COORDINADOR)
  assignAdvisor(@Param('id') id: string, @Param('advisorId') advisorId: string) {
    return this.service.assignAdvisor(+id, +advisorId);
  }

  // Horas
  @Post('hours')
  @Roles(RolUsuario.ESTUDIANTE)
  addHours(@Body() dto: CreateHoursTrackingDto) {
    return this.service.addHoursTracking(dto);
  }

  @Patch('hours/:id/approve/company')
  @Roles(RolUsuario.REPRESENTANTE_EMPRESA)
  approveHoursCompany(@Param('id') id: string) {
    return this.service.approveHoursTracking(+id, 'empresa');
  }

  @Patch('hours/:id/approve/advisor')
  @Roles(RolUsuario.ASESOR)
  approveHoursAdvisor(@Param('id') id: string) {
    return this.service.approveHoursTracking(+id, 'asesor');
  }

  // Informes
  @Post('reports')
  @Roles(RolUsuario.ESTUDIANTE)
  submitReport(@Body() dto: CreateInternshipReportDto) {
    return this.service.submitReport(dto);
  }

  @Patch('reports/:id/evaluate')
  @Roles(RolUsuario.ASESOR)
  evaluateReport(@Param('id') id: string, @Body('estado') estado: string, @Body('comentario') comentario: string) {
    return this.service.evaluateReport(+id, estado as any, comentario);
  }

  // Endpoints para estudiantes
  @Get('my-internship')
  @Roles(RolUsuario.ESTUDIANTE)
  async getMyInternship(@CurrentUser() user: any) {
    const student = await this.studentsService.findByUsuarioId(user.sub);
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    const internship = await this.service.getMyInternship(student.id);
    if (!internship) {
      return { message: 'No tienes una práctica activa' };
    }
    return internship;
  }

  @Get('my-applications')
  @Roles(RolUsuario.ESTUDIANTE)
  async getMyApplications(@CurrentUser() user: any) {
    const student = await this.studentsService.findByUsuarioId(user.sub);
    if (!student) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return this.service.getApplicationsByStudent(student.id);
  }

  // Evaluación final
  @Post('internship/:id/evaluation')
  @Roles(RolUsuario.ASESOR, RolUsuario.REPRESENTANTE_EMPRESA)
  async finalEvaluation(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: any) {
    // Validar que el asesor esté asignado a esta práctica (si es asesor)
    if (user.rol === RolUsuario.ASESOR || (user.roles && user.roles.includes(RolUsuario.ASESOR))) {
      const internship = await this.service.findInternshipById(+id);
      if (internship.asesorAcademicoId !== user.sub) {
        throw new ForbiddenException('No estás asignado como asesor de esta práctica');
      }
    }
    return this.service.finalEvaluation(+id, dto);
  }

  // Dashboard de empresa - estadísticas
  @Get('company/dashboard-stats')
  @Roles(RolUsuario.REPRESENTANTE_EMPRESA, RolUsuario.ADMIN)
  getCompanyDashboardStats(@Query('empresaId') empresaId: string) {
    return this.service.getCompanyDashboardStats(+empresaId);
  }

  // Prácticas de una empresa específica
  @Get('company/internships')
  @Roles(RolUsuario.REPRESENTANTE_EMPRESA, RolUsuario.ADMIN)
  getCompanyInternships(@Query('empresaId') empresaId: string) {
    return this.service.findAllInternships({ empresaId: +empresaId } as any);
  }

  // Postulaciones de una empresa específica (a través de sus ofertas)
  @Get('company/applications')
  @Roles(RolUsuario.REPRESENTANTE_EMPRESA, RolUsuario.ADMIN)
  getCompanyApplications(@Query('empresaId') empresaId: string) {
    return this.service.getApplicationsByCompany(+empresaId);
  }

  // Aprobar/rechazar postulación (solo coordinador y admin)
  // La empresa puede preseleccionar, pero la aprobación final es del coordinador
  @Patch('applications/:id/approve')
  @Roles(RolUsuario.COORDINADOR, RolUsuario.ADMIN)
  approveApplication(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.reviewApplication(+id, { estado: ApplicationEstado.APROBADO }, user.sub);
  }

  @Patch('applications/:id/reject')
  @Roles(RolUsuario.COORDINADOR, RolUsuario.ADMIN)
  rejectApplication(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.reviewApplication(+id, { estado: ApplicationEstado.RECHAZADO }, user.sub);
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