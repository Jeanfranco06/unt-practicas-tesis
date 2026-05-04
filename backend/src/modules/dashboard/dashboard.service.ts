import { Injectable } from '@nestjs/common';
import { InternshipsService } from '../internships/internships.service';
import { ThesisService } from '../thesis/thesis.service';
import { CompaniesService } from '../companies/companies.service';
import { StudentsService } from '../students/students.service';
import { AgreementsService } from '../agreements/agreements.service';

@Injectable()
export class DashboardService {
  constructor(
    private internshipsService: InternshipsService,
    private thesisService: ThesisService,
    private companiesService: CompaniesService,
    private studentsService: StudentsService,
    private agreementsService: AgreementsService,
  ) {}

  async getStats() {
    const internships = await this.internshipsService.findAllInternships();
    const activeInternships = internships.filter(i => i.estado === 'activa').length;
    const thesisStats = await this.thesisService.getStats();
    const activeAgreements = await this.agreementsService.countActive();
    const totalStudents = (await this.studentsService.findAll()).length;

    // Datos para gráficos
    const internshipByMonth = this.groupByMonth(internships);
    const thesisByArea = thesisStats.porArea;

    return {
      activeInternships,
      activeThesis: thesisStats.enDesarrollo,
      activeAgreements,
      totalStudents,
      internshipByMonth,
      thesisByArea,
    };
  }

  private groupByMonth(internships: any[]) {
    const months: Record<string, number> = {};
    internships.forEach(i => {
      // Handle both Date objects and ISO strings from TypeORM
      const fecha = i.fechaInicio instanceof Date
        ? i.fechaInicio
        : new Date(i.fechaInicio);
      const month = fecha.toISOString().slice(0, 7);
      months[month] = (months[month] || 0) + 1;
    });
    return Object.entries(months).map(([month, count]) => ({ month, count }));
  }
}