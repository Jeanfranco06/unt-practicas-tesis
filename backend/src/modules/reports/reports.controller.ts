import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('internships')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getInternshipReport(@Res() res: Response) {
    const pdf = await this.reportsService.generateInternshipReportPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_practicas.pdf');
    res.send(pdf);
  }

  @Get('thesis')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getThesisReport(@Res() res: Response) {
    const pdf = await this.reportsService.generateThesisReportPDF();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_tesis.pdf');
    res.send(pdf);
  }
}