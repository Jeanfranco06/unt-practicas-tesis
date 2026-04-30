import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import { InternshipsService } from '../internships/internships.service';
import { ThesisService } from '../thesis/thesis.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private internshipsService: InternshipsService,
    private thesisService: ThesisService,
    private companiesService: CompaniesService,
  ) {}

  async generateInternshipReportPDF(filters?: any): Promise<Buffer> {
    const data = await this.collectInternshipData(filters);
    const html = this.renderTemplate('internship-report', data);
    return this.generatePDF(html);
  }

  async generateThesisReportPDF(filters?: any): Promise<Buffer> {
    const data = await this.collectThesisData(filters);
    const html = this.renderTemplate('thesis-report', data);
    return this.generatePDF(html);
  }

  public async collectInternshipData(filters: any) {
    const internships = await this.internshipsService.findAllInternships(); // método a implementar
    const companies = await this.companiesService.findAll();
    return {
      fecha: new Date().toLocaleDateString('es-PE'),
      totalPracticas: internships.length,
      activas: internships.filter(i => i.estado === 'activa').length,
      finalizadas: internships.filter(i => i.estado === 'finalizada').length,
      empresasParticipantes: companies.length,
      detalle: internships.slice(0, 20),
    };
  }

  public async collectThesisData(filters: any) {
    const projects = await this.thesisService.findAllProjects();
    return {
      fecha: new Date().toLocaleDateString('es-PE'),
      totalProyectos: projects.length,
      enDesarrollo: projects.filter(p => p.estado === 'en_desarrollo').length,
      culminados: projects.filter(p => p.estado === 'culminado').length,
      areaMasComun: this.getMostCommonArea(projects),
      detalle: projects.slice(0, 20),
    };
  }

  private getMostCommonArea(projects: any[]): string {
    const counts = projects.reduce((acc, p) => {
      acc[p.areaConocimiento] = (acc[p.areaConocimiento] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), '');
  }

  private renderTemplate(templateName: string, data: any): string {
    const templates: Record<string, string> = {
      'internship-report': `
        <html>
          <head><meta charset="UTF-8"><title>Reporte de Prácticas</title></head>
          <body>
            <h1>Reporte de Prácticas Preprofesionales</h1>
            <p>Fecha: {{fecha}}</p>
            <p>Total prácticas: {{totalPracticas}}</p>
            <p>Activas: {{activas}} | Finalizadas: {{finalizadas}}</p>
            <p>Empresas participantes: {{empresasParticipantes}}</p>
            <h2>Detalle</h2>
            <table border="1" cellpadding="5">
              <tr><th>ID</th><th>Estudiante</th><th>Empresa</th><th>Estado</th><th>Horas</th></tr>
              {{#each detalle}}
                <tr><td>{{id}}</td><td>{{estudianteId}}</td><td>{{empresaId}}</td><td>{{estado}}</td><td>{{horasCompletadas}}/{{horasTotalesRequeridas}}</td></tr>
              {{/each}}
            </table>
          </body>
        </html>
      `,
      'thesis-report': `
        <html>
          <head><meta charset="UTF-8"><title>Reporte de Tesis</title></head>
          <body>
            <h1>Reporte de Proyectos de Tesis</h1>
            <p>Fecha: {{fecha}}</p>
            <p>Total proyectos: {{totalProyectos}}</p>
            <p>En desarrollo: {{enDesarrollo}} | Culminados: {{culminados}}</p>
            <p>Área más común: {{areaMasComun}}</p>
            <h2>Detalle</h2>
            <table border="1" cellpadding="5">
              <tr><th>ID</th><th>Título</th><th>Área</th><th>Estado</th></tr>
              {{#each detalle}}
                <tr><td>{{id}}</td><td>{{titulo}}</td><td>{{areaConocimiento}}</td><td>{{estado}}</td></tr>
              {{/each}}
            </table>
          </body>
        </html>
      `,
    };
    const compiled = handlebars.compile(templates[templateName]);
    return compiled(data);
  }

  private async generatePDF(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
    await browser.close();
    return Buffer.from(pdf);
  }
}