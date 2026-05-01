import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService, ReportFilters } from './reports.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolUsuario } from '../users/entities/user.entity';

@Controller('reports')
@UseGuards(AuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // ==================== REPORTES DE OPERACIÓN (DÍA A DÍA) ====================

  /**
   * 1. Prácticas en curso
   * Lista de estudiantes en prácticas activas
   */
  @Get('operacion/practicas-en-curso')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getPracticasEnCurso(@Query() filters: ReportFilters) {
    return this.reportsService.getPracticasEnCurso(filters);
  }

  /**
   * 2. Postulaciones a prácticas
   * Ofertas disponibles y número de postulantes por estado
   */
  @Get('operacion/postulaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getPostulacionesPracticas(@Query() filters: ReportFilters) {
    return this.reportsService.getPostulacionesPracticas(filters);
  }

  /**
   * 3. Seguimiento de tesis
   * Tesis en proceso con estado y entregables
   */
  @Get('operacion/seguimiento-tesis')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getSeguimientoTesis(@Query() filters: ReportFilters) {
    return this.reportsService.getSeguimientoTesis(filters);
  }

  /**
   * 4. Evaluaciones y aprobaciones
   * Entregables revisados y pendientes
   */
  @Get('operacion/evaluaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getEvaluacionesYAprobaciones(@Query() filters: ReportFilters) {
    return this.reportsService.getEvaluacionesYAprobaciones(filters);
  }

  /**
   * 5. Sustentaciones programadas
   * Fechas, estudiantes y jurados
   */
  @Get('operacion/sustentaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getSustentacionesProgramadas(@Query() filters: ReportFilters) {
    return this.reportsService.getSustentacionesProgramadas(filters);
  }

  /**
   * 6. Convenios activos
   * Convenios vigentes con fechas de vencimiento
   */
  @Get('operacion/convenios')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getConveniosActivos(@Query() filters: ReportFilters) {
    return this.reportsService.getConveniosActivos(filters);
  }

  /**
   * 7. Alertas operativas
   * Convenios por vencer, sin avance, fuera de plazo
   */
  @Get('operacion/alertas')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getAlertasOperativas() {
    return this.reportsService.getAlertasOperativas();
  }

  // ==================== REPORTES DE GESTIÓN (ESTRATÉGICOS) ====================

  /**
   * 1. Indicadores generales del sistema
   * Visión global institucional
   */
  @Get('gestion/indicadores-generales')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getIndicadoresGenerales() {
    return this.reportsService.getIndicadoresGenerales();
  }

  /**
   * 2. Rendimiento de prácticas
   * % colocación y tiempo promedio
   */
  @Get('gestion/rendimiento-practicas')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getRendimientoPracticas() {
    return this.reportsService.getRendimientoPracticas();
  }

  /**
   * 3. Participación de empresas
   * Empresas más activas
   */
  @Get('gestion/participacion-empresas')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getParticipacionEmpresas() {
    return this.reportsService.getParticipacionEmpresas();
  }

  /**
   * 4. Rendimiento de tesis
   * % aprobadas/rechazadas
   */
  @Get('gestion/rendimiento-tesis')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getRendimientoTesis() {
    return this.reportsService.getRendimientoTesis();
  }

  /**
   * 5. Desempeño de asesores
   * Carga por docente
   */
  @Get('gestion/desempeno-asesores')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getDesempenoAsesores() {
    return this.reportsService.getDesempenoAsesores();
  }

  /**
   * 6. Cumplimiento de plazos
   * Entregas a tiempo vs retrasadas
   */
  @Get('gestion/cumplimiento-plazos')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getCumplimientoPlazos() {
    return this.reportsService.getCumplimientoPlazos();
  }

  /**
   * 7. Evolución temporal
   * Prácticas y tesis por periodo
   */
  @Get('gestion/evolucion-temporal')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getEvolucionTemporal(@Query() filters: ReportFilters) {
    return this.reportsService.getEvolucionTemporal(filters);
  }

  /**
   * 8. Estado de convenios
   * Activos vs vencidos
   */
  @Get('gestion/estado-convenios')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getEstadoConvenios() {
    return this.reportsService.getEstadoConvenios();
  }

  // ==================== REPORTES PDF ====================

  @Get('pdf/practicas-en-curso')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getPracticasEnCursoPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('practicas-en-curso', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_practicas_en_curso.pdf');
    res.send(pdf);
  }

  @Get('pdf/postulaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getPostulacionesPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('postulaciones', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_postulaciones.pdf');
    res.send(pdf);
  }

  @Get('pdf/seguimiento-tesis')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getSeguimientoTesisPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('seguimiento-tesis', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_seguimiento_tesis.pdf');
    res.send(pdf);
  }

  @Get('pdf/evaluaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getEvaluacionesPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('evaluaciones', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_evaluaciones.pdf');
    res.send(pdf);
  }

  @Get('pdf/sustentaciones')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getSustentacionesPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('sustentaciones', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_sustentaciones.pdf');
    res.send(pdf);
  }

  @Get('pdf/convenios')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getConveniosPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('convenios', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_convenios.pdf');
    res.send(pdf);
  }

  @Get('pdf/alertas')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getAlertasPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('alertas');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_alertas.pdf');
    res.send(pdf);
  }

  @Get('pdf/indicadores-generales')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getIndicadoresGeneralesPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('indicadores-generales');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_indicadores_generales.pdf');
    res.send(pdf);
  }

  @Get('pdf/rendimiento-practicas')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getRendimientoPracticasPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('rendimiento-practicas');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_rendimiento_practicas.pdf');
    res.send(pdf);
  }

  @Get('pdf/participacion-empresas')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getParticipacionEmpresasPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('participacion-empresas');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_participacion_empresas.pdf');
    res.send(pdf);
  }

  @Get('pdf/rendimiento-tesis')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getRendimientoTesisPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('rendimiento-tesis');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_rendimiento_tesis.pdf');
    res.send(pdf);
  }

  @Get('pdf/desempeno-asesores')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getDesempenoAsesoresPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('desempeno-asesores');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_desempeno_asesores.pdf');
    res.send(pdf);
  }

  @Get('pdf/cumplimiento-plazos')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getCumplimientoPlazosPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('cumplimiento-plazos');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_cumplimiento_plazos.pdf');
    res.send(pdf);
  }

  @Get('pdf/evolucion-temporal')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getEvolucionTemporalPDF(@Query() filters: ReportFilters, @Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('evolucion-temporal', filters);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_evolucion_temporal.pdf');
    res.send(pdf);
  }

  @Get('pdf/estado-convenios')
  @Roles(RolUsuario.ADMIN, RolUsuario.COORDINADOR)
  async getEstadoConveniosPDF(@Res() res: Response) {
    const pdf = await this.reportsService.generateReportPDF('estado-convenios');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_estado_convenios.pdf');
    res.send(pdf);
  }
}