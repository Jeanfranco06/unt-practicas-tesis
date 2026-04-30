import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards } from '@nestjs/common';
import { InternshipsService } from './internships.service';
import { CreateInternshipOfferDto, UpdateInternshipOfferDto } from './dto/internship-offer.dto';
import { CreateApplicationDto, ReviewApplicationDto } from './dto/application.dto';
import { CreateHoursTrackingDto } from './dto/hours-tracking.dto';
import { CreateInternshipReportDto } from './dto/internship-report.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('internships')
@UseGuards(AuthGuard, RolesGuard)
export class InternshipsController {
  constructor(private readonly service: InternshipsService) {}

  // Ofertas
  @Get('offers')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR, RolUsuario.ESTUDIANTE, RolUsuario.REPRESENTANTE_EMPRESA)
  findAllOffers(@CurrentUser() user: any) {
    if (user.rol === RolUsuario.REPRESENTANTE_EMPRESA) {
      // asumiendo que se relaciona empresa por usuario, simplificado
      return this.service.findAllOffers({ empresaId: user.empresaId }); // necesitarías relacion
    }
    return this.service.findAllOffers();
  }

  @Post('offers')
  @Roles(RolUsuario.ADMIN, RolUsuario.REPRESENTANTE_EMPRESA)
  createOffer(@Body() dto: CreateInternshipOfferDto) {
    return this.service.createOffer(dto);
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
  apply(@Body() dto: CreateApplicationDto, @CurrentUser() user: any) {
    dto.estudianteId = user.id; // asumiendo que el estudiante tiene user.id relacionado
    return this.service.apply(dto);
  }

  @Patch('applications/:id/review')
  @Roles(RolUsuario.COORDINADOR)
  reviewApplication(@Param('id') id: string, @Body() reviewDto: ReviewApplicationDto, @CurrentUser() user: any) {
    return this.service.reviewApplication(+id, reviewDto, user.sub);
  }

  // Prácticas
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

  // Evaluación final
  @Post('internship/:id/evaluation')
  @Roles(RolUsuario.ASESOR, RolUsuario.REPRESENTANTE_EMPRESA)
  finalEvaluation(@Param('id') id: string, @Body() dto: any) {
    return this.service.finalEvaluation(+id, dto);
  }
}