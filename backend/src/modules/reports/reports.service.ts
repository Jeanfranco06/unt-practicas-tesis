import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, IsNull, Not, In } from 'typeorm';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Internship, InternshipEstado } from '../internships/entities/internship.entity';
import { HoursTracking } from '../internships/entities/hours-tracking.entity';
import { InternshipApplication, ApplicationEstado } from '../internships/entities/internship-application.entity';
import { InternshipOffer, OfertaEstado } from '../internships/entities/internship-offer.entity';
import { ThesisProject, ThesisEstado } from '../thesis/entities/thesis-project.entity';
import { ThesisAssignment, AsignacionTipo } from '../thesis/entities/thesis-assignment.entity';
import { Deliverable } from '../thesis/entities/deliverable.entity';
import { DeliverableSubmission, EntregaEstado } from '../thesis/entities/deliverable-submission.entity';
import { DefenseRecord } from '../thesis/entities/defense-record.entity';
import { Agreement, EstadoConvenio, calcularEstadoConvenio, normalizarEstadoConvenio } from '../agreements/entities/agreement.entity';
import { Company } from '../companies/entities/company.entity';
import { Student } from '../students/entities/student.entity';
import { User, RolUsuario } from '../users/entities/user.entity';

export interface ReportFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  estado?: string;
  empresaId?: number;
  estudianteId?: number;
  asesorId?: number;
  area?: string;
  tipo?: string;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Internship) private internshipRepo: Repository<Internship>,
    @InjectRepository(InternshipApplication) private applicationRepo: Repository<InternshipApplication>,
    @InjectRepository(InternshipOffer) private offerRepo: Repository<InternshipOffer>,
    @InjectRepository(ThesisProject) private thesisRepo: Repository<ThesisProject>,
    @InjectRepository(ThesisAssignment) private assignmentRepo: Repository<ThesisAssignment>,
    @InjectRepository(Deliverable) private deliverableRepo: Repository<Deliverable>,
    @InjectRepository(DeliverableSubmission) private submissionRepo: Repository<DeliverableSubmission>,
    @InjectRepository(DefenseRecord) private defenseRepo: Repository<DefenseRecord>,
    @InjectRepository(Agreement) private agreementRepo: Repository<Agreement>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(HoursTracking) private hoursRepo: Repository<HoursTracking>,
  ) {}

  /**
   * Obtiene el logo de la UNT como base64 para incrustar en PDFs
   */
  private getLogoBase64(): string {
    try {
      const logoPath = path.join(process.cwd(), 'src', 'assets', 'images', 'logo-unt.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
      // Intentar ruta alternativa
      const altPath = path.join(__dirname, '..', '..', 'assets', 'images', 'logo-unt.png');
      if (fs.existsSync(altPath)) {
        const logoBuffer = fs.readFileSync(altPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
      this.logger.warn('Logo UNT no encontrado en ninguna ruta');
      return '';
    } catch (error) {
      this.logger.error('Error al cargar logo UNT:', error);
      return '';
    }
  }

  // ==================== REPORTES DE OPERACIÓN (DÍA A DÍA) ====================

  /**
   * 1. Prácticas en curso
   * Lista de estudiantes en prácticas activas con empresa, horas y estado
   */
  async getPracticasEnCurso(filters?: ReportFilters): Promise<any> {
    const where: any = {};
    
    // Validar estado para InternshipEstado
    const validInternshipEstados = Object.values(InternshipEstado);
    if (filters?.estado && validInternshipEstados.includes(filters.estado as InternshipEstado)) {
      where.estado = filters.estado;
    } else {
      // Default: mostrar prácticas activas si no hay filtro de estado válido
      where.estado = InternshipEstado.ACTIVA;
    }
    
    if (filters?.fechaDesde && filters?.fechaHasta) {
      where.fechaInicio = Between(new Date(filters.fechaDesde), new Date(filters.fechaHasta));
    }
    if (filters?.empresaId) where.empresaId = filters.empresaId;
    if (filters?.estudianteId) where.estudianteId = filters.estudianteId;

    const practicas = await this.internshipRepo.find({
      where,
      relations: ['estudiante', 'estudiante.usuario', 'empresa', 'asesorAcademico'],
      order: { fechaInicio: 'DESC' },
    });

    // Obtener IDs de prácticas para consultar seguimientos de horas
    const practicaIds = practicas.map(p => p.id);
    
    // Calcular horas desde seguimientos (no desde el campo de BD que puede estar desactualizado)
    const hoursTracking = practicaIds.length > 0
      ? await this.hoursRepo.find({ where: { practicaId: In(practicaIds) } })
      : [];
    
    // Calcular horas por práctica
    const horasPorPractica = new Map<number, number>();
    hoursTracking.forEach(h => {
      const current = horasPorPractica.get(h.practicaId) || 0;
      horasPorPractica.set(h.practicaId, current + h.horas);
    });

    // Calcular totales usando horas reales de seguimientos
    const horasCalculadas = practicas.map(p => ({
      ...p,
      horasCompletadasReal: horasPorPractica.get(p.id) || 0,
    }));

    const totalHorasAcumuladas = horasCalculadas.reduce((sum, p) => sum + p.horasCompletadasReal, 0);

    return {
      total: practicas.length,
      horasAcumuladasTotal: totalHorasAcumuladas,
      promedioHorasCompletadas: practicas.length > 0
        ? totalHorasAcumuladas / practicas.length
        : 0,
      items: horasCalculadas.map(p => ({
        id: p.id,
        estudiante: `${p.estudiante?.usuario?.nombre || ''} ${p.estudiante?.usuario?.apellidoPaterno || ''}`,
        codigoUniversitario: p.estudiante?.codigoUniversitario,
        empresa: p.empresa?.razonSocial || p.empresa?.nombreComercial,
        horasCompletadas: p.horasCompletadasReal,
        horasTotalesRequeridas: p.horasTotalesRequeridas,
        progreso: ((p.horasCompletadasReal / p.horasTotalesRequeridas) * 100).toFixed(1),
        fechaInicio: p.fechaInicio,
        fechaFin: p.fechaFin,
        estado: p.estado,
        asesorAcademico: p.asesorAcademico
          ? `${p.asesorAcademico.nombre} ${p.asesorAcademico.apellidoPaterno || ''}`
          : 'Sin asignar',
      })),
    };
  }

  /**
   * 2. Postulaciones a prácticas
   * Ofertas disponibles y número de postulantes por estado
   */
  async getPostulacionesPracticas(filters?: ReportFilters): Promise<any> {
    const offerWhere: any = {};
    // Solo aplicar filtro de estado si es válido para OfertaEstado
    const validOfertaEstados = Object.values(OfertaEstado);
    if (filters?.estado && validOfertaEstados.includes(filters.estado as OfertaEstado)) {
      offerWhere.estado = filters.estado;
    }
    if (filters?.empresaId) offerWhere.empresaId = filters.empresaId;

    const ofertas = await this.offerRepo.find({
      where: offerWhere,
      relations: ['empresa'],
      order: { creadoEn: 'DESC' },
    });

    const applicationsWhere: any = {};
    if (filters?.fechaDesde && filters?.fechaHasta) {
      applicationsWhere.fechaPostulacion = Between(
        new Date(filters.fechaDesde),
        new Date(filters.fechaHasta),
      );
    }

    const postulaciones = await this.applicationRepo.find({
      where: applicationsWhere,
      relations: ['oferta', 'estudiante', 'estudiante.usuario'],
    });

    const porEstado = {
      postulado: postulaciones.filter(p => p.estado === ApplicationEstado.POSTULADO).length,
      preseleccionado: postulaciones.filter(p => p.estado === ApplicationEstado.PRESELECCIONADO).length,
      aprobado: postulaciones.filter(p => p.estado === ApplicationEstado.APROBADO).length,
      rechazado: postulaciones.filter(p => p.estado === ApplicationEstado.RECHAZADO).length,
    };

    return {
      totalOfertas: ofertas.length,
      totalPostulaciones: postulaciones.length,
      porEstado,
      ofertas: ofertas.map(o => {
        const postulantesOferta = postulaciones.filter(p => p.ofertaId === o.id);
        return {
          id: o.id,
          titulo: o.titulo,
          empresa: o.empresa?.razonSocial || o.empresa?.nombreComercial,
          cupos: o.cupos,
          postulantes: postulantesOferta.length,
          porEstado: {
            postulado: postulantesOferta.filter(p => p.estado === ApplicationEstado.POSTULADO).length,
            preseleccionado: postulantesOferta.filter(p => p.estado === ApplicationEstado.PRESELECCIONADO).length,
            aprobado: postulantesOferta.filter(p => p.estado === ApplicationEstado.APROBADO).length,
            rechazado: postulantesOferta.filter(p => p.estado === ApplicationEstado.RECHAZADO).length,
          },
          fechaFinPostulacion: o.fechaFinPostulacion,
          estado: o.estado,
        };
      }),
    };
  }

  /**
   * 3. Seguimiento de tesis
   * Tesis en proceso con estado, entregables pendientes y observaciones
   */
  async getSeguimientoTesis(filters?: ReportFilters): Promise<any> {
    const where: any = { activo: true };
    // Solo aplicar filtro de estado si es válido para ThesisEstado
    const validThesisEstados = Object.values(ThesisEstado);
    if (filters?.estado && validThesisEstados.includes(filters.estado as ThesisEstado)) {
      where.estado = filters.estado;
    }
    if (filters?.area) where.areaConocimiento = filters.area;
    if (filters?.estudianteId) where.estudianteId = filters.estudianteId;

    const proyectos = await this.thesisRepo.find({
      where,
      relations: ['estudiante', 'estudiante.usuario', 'asignaciones', 'asignaciones.docente', 'entregables', 'entregables.entregas'],
      order: { fechaRegistro: 'DESC' },
    });

    const proyectosConDetalle = proyectos.map(p => {
      const asesor = p.asignaciones?.find(a => a.tipo === AsignacionTipo.ASESOR);
      const jurados = p.asignaciones?.filter(a => a.tipo === AsignacionTipo.JURADO) || [];
      
      const entregablesPendientes = (p.entregables || []).filter(e => {
        const entregas = e.entregas || [];
        const ultimaEntrega = entregas[entregas.length - 1];
        return !ultimaEntrega || ultimaEntrega.estado === EntregaEstado.OBSERVADO;
      });

      const entregablesAtrasados = (p.entregables || []).filter(e => {
        const entregas = e.entregas || [];
        const ultimaEntrega = entregas[entregas.length - 1];
        return new Date(e.fechaLimite) < new Date() && 
               (!ultimaEntrega || ultimaEntrega.estado !== EntregaEstado.APROBADO);
      });

      return {
        id: p.id,
        titulo: p.titulo,
        estudiante: `${p.estudiante?.usuario?.nombre || ''} ${p.estudiante?.usuario?.apellidoPaterno || ''}`,
        area: p.areaConocimiento,
        estado: p.estado,
        asesor: asesor?.docente
          ? `${asesor.docente.nombre} ${asesor.docente.apellidoPaterno || ''}`
          : 'Sin asignar',
        juradosAsignados: jurados.length,
        totalEntregables: p.entregables?.length || 0,
        entregablesPendientes: entregablesPendientes.length,
        entregablesAtrasados: entregablesAtrasados.length,
        fechaRegistro: p.fechaRegistro,
        fechaAprobacion: p.fechaAprobacion,
      };
    });

    return {
      total: proyectos.length,
      porEstado: {
        en_registro: proyectos.filter(p => p.estado === ThesisEstado.EN_REGISTRO).length,
        propuesto: proyectos.filter(p => p.estado === ThesisEstado.PROPUESTO).length,
        aprobado: proyectos.filter(p => p.estado === ThesisEstado.APROBADO).length,
        en_desarrollo: proyectos.filter(p => p.estado === ThesisEstado.EN_DESARROLLO).length,
        en_revision: proyectos.filter(p => p.estado === ThesisEstado.EN_REVISION).length,
      },
      conAtrasos: proyectosConDetalle.filter(p => p.entregablesAtrasados > 0).length,
      sinAsesor: proyectosConDetalle.filter(p => p.asesor === 'Sin asignar').length,
      items: proyectosConDetalle,
    };
  }

  /**
   * 4. Evaluaciones y aprobaciones
   * Entregables revisados/aprobados/rechazados y evaluaciones pendientes
   */
  async getEvaluacionesYAprobaciones(filters?: ReportFilters): Promise<any> {
    const where: any = {};
    if (filters?.fechaDesde && filters?.fechaHasta) {
      where.creadoEn = Between(new Date(filters.fechaDesde), new Date(filters.fechaHasta));
    }
    if (filters?.asesorId) where.revisorId = filters.asesorId;

    const entregas = await this.submissionRepo.find({
      where,
      relations: ['entregable', 'entregable.proyecto', 'entregable.proyecto.estudiante', 'entregable.proyecto.estudiante.usuario'],
      order: { creadoEn: 'DESC' },
    });

    const porEstado = {
      entregado: entregas.filter(e => e.estado === EntregaEstado.ENTREGADO).length,
      revisando: entregas.filter(e => e.estado === EntregaEstado.REVISANDO).length,
      aprobado: entregas.filter(e => e.estado === EntregaEstado.APROBADO).length,
      observado: entregas.filter(e => e.estado === EntregaEstado.OBSERVADO).length,
    };

    const pendientesRevision = await this.submissionRepo.find({
      where: { estado: EntregaEstado.ENTREGADO },
      relations: ['entregable', 'entregable.proyecto', 'entregable.proyecto.estudiante', 'entregable.proyecto.estudiante.usuario'],
    });

    return {
      totalEvaluado: entregas.length,
      porEstado,
      pendientesRevision: pendientesRevision.length,
      tasaAprobacion: entregas.length > 0
        ? ((porEstado.aprobado / entregas.length) * 100).toFixed(1)
        : 0,
      itemsPendientes: pendientesRevision.map(e => ({
        id: e.id,
        entregable: e.entregable?.nombre,
        proyecto: e.entregable?.proyecto?.titulo,
        estudiante: `${e.entregable?.proyecto?.estudiante?.usuario?.nombre || ''} ${e.entregable?.proyecto?.estudiante?.usuario?.apellidoPaterno || ''}`,
        fechaEntrega: e.fechaEntrega,
        diasPendientes: Math.floor((new Date().getTime() - new Date(e.fechaEntrega).getTime()) / (1000 * 60 * 60 * 24)),
      })),
    };
  }

  /**
   * 5. Sustentaciones programadas
   * Fechas, estudiantes y jurados asignados
   */
  async getSustentacionesProgramadas(filters?: ReportFilters): Promise<any> {
    const where: any = {};
    if (filters?.fechaDesde && filters?.fechaHasta) {
      where.fechaSustentacion = Between(new Date(filters.fechaDesde), new Date(filters.fechaHasta));
    } else {
      // Por defecto mostrar desde hoy en adelante
      where.fechaSustentacion = MoreThan(new Date());
    }

    const sustentaciones = await this.defenseRepo.find({
      where,
      relations: ['proyecto', 'proyecto.estudiante', 'proyecto.estudiante.usuario', 'proyecto.asignaciones', 'proyecto.asignaciones.docente'],
      order: { fechaSustentacion: 'ASC' },
    });

    return {
      total: sustentaciones.length,
      porMes: this.groupByMonth(sustentaciones.map(s => s.fechaSustentacion)),
      items: sustentaciones.map(s => {
        const jurados = s.proyecto?.asignaciones?.filter(a => a.tipo === AsignacionTipo.JURADO) || [];
        return {
          id: s.id,
          fecha: s.fechaSustentacion,
          horaInicio: s.horaInicio,
          horaFin: s.horaFin,
          lugar: s.lugar,
          proyecto: s.proyecto?.titulo,
          estudiante: `${s.proyecto?.estudiante?.usuario?.nombre || ''} ${s.proyecto?.estudiante?.usuario?.apellidoPaterno || ''}`,
          jurados: jurados.map(j => `${j.docente?.nombre || ''} ${j.docente?.apellidoPaterno || ''} (${j.rolEspecifico || 'Miembro'})`),
          resultado: s.resultado,
          notaFinal: s.notaFinal,
        };
      }),
    };
  }

  /**
   * 6. Convenios activos
   * Convenios vigentes con empresas y fechas de vencimiento
   */
  async getConveniosActivos(filters?: ReportFilters): Promise<any> {
    const where: any = {};
    // No filtrar por estado, lo calcularemos por fecha
    if (filters?.empresaId) where.empresaId = filters.empresaId;

    const allConvenios = await this.agreementRepo.find({
      where,
      relations: ['empresa'],
      order: { fechaVencimiento: 'ASC' },
    });

    // Filtrar solo convenios realmente vigentes (no cancelados y fecha no vencida)
    const convenios = allConvenios.filter(c => 
      normalizarEstadoConvenio(c.estado, c.fechaVencimiento) === EstadoConvenio.VIGENTE
    );

    const ahora = new Date();
    const treintaDias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sesentaDias = new Date(ahora.getTime() + 60 * 24 * 60 * 60 * 1000);

    const porVencer30 = convenios.filter(c => new Date(c.fechaVencimiento) <= treintaDias && new Date(c.fechaVencimiento) > ahora);
    const porVencer60 = convenios.filter(c => new Date(c.fechaVencimiento) <= sesentaDias && new Date(c.fechaVencimiento) > treintaDias);

    return {
      total: convenios.length,
      porVencer30Dias: porVencer30.length,
      porVencer60Dias: porVencer60.length,
      porTipo: {
        marco: convenios.filter(c => c.tipo === 'marco').length,
        especifico: convenios.filter(c => c.tipo === 'especifico').length,
      },
      items: convenios.map(c => {
        const diasRestantes = Math.ceil((new Date(c.fechaVencimiento).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: c.id,
          empresa: c.empresa?.razonSocial || c.empresa?.nombreComercial,
          tipo: c.tipo,
          fechaInicio: c.fechaInicio,
          fechaVencimiento: c.fechaVencimiento,
          diasRestantes,
          alerta: diasRestantes <= 30 ? 'critica' : diasRestantes <= 60 ? 'advertencia' : 'normal',
          objetoContrato: c.objeto ? c.objeto.substring(0, 100) + '...' : '',
        };
      }),
    };
  }

  /**
   * 7. Alertas operativas
   * Convenios por vencer, estudiantes sin avance, entregas fuera de plazo
   */
  async getAlertasOperativas(): Promise<any> {
    const ahora = new Date();
    const treintaDias = new Date(ahora.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Convenios por vencer (obtener todos y filtrar por fecha, no solo por estado almacenado)
    const allConvenios = await this.agreementRepo.find({
      relations: ['empresa'],
    });
    
    // Filtrar convenios realmente vigentes que vencen en 30 días
    const conveniosPorVencer = allConvenios.filter(c => {
      const esVigente = normalizarEstadoConvenio(c.estado, c.fechaVencimiento) === EstadoConvenio.VIGENTE;
      const venceEn30Dias = new Date(c.fechaVencimiento) <= treintaDias && new Date(c.fechaVencimiento) > ahora;
      return esVigente && venceEn30Dias;
    });

    // Estudiantes sin avance (prácticas activas con menos del 25% de horas)
    const practicasSinAvance = await this.internshipRepo.find({
      where: {
        estado: InternshipEstado.ACTIVA,
      },
      relations: ['estudiante', 'estudiante.usuario', 'empresa'],
    });
    const sinAvance = practicasSinAvance.filter(p => (p.horasCompletadas / p.horasTotalesRequeridas) < 0.25);

    // Entregas fuera de plazo
    const entregasAtrasadas = await this.submissionRepo.find({
      where: [
        { estado: EntregaEstado.OBSERVADO },
        { estado: EntregaEstado.ENTREGADO },
      ],
      relations: ['entregable', 'entregable.proyecto', 'entregable.proyecto.estudiante', 'entregable.proyecto.estudiante.usuario'],
    });
    const atrasadas = entregasAtrasadas.filter(e => new Date(e.entregable.fechaLimite) < ahora);

    return {
      conveniosPorVencer: {
        total: conveniosPorVencer.length,
        items: conveniosPorVencer.map(c => ({
          id: c.id,
          empresa: c.empresa?.razonSocial || c.empresa?.nombreComercial,
          fechaVencimiento: c.fechaVencimiento,
          diasRestantes: Math.ceil((new Date(c.fechaVencimiento).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)),
        })),
      },
      estudiantesSinAvance: {
        total: sinAvance.length,
        items: sinAvance.map(p => ({
          id: p.id,
          estudiante: `${p.estudiante?.usuario?.nombre || ''} ${p.estudiante?.usuario?.apellidoPaterno || ''}`,
          empresa: p.empresa?.razonSocial || p.empresa?.nombreComercial,
          horasCompletadas: p.horasCompletadas,
          horasRequeridas: p.horasTotalesRequeridas,
          progreso: ((p.horasCompletadas / p.horasTotalesRequeridas) * 100).toFixed(1),
        })),
      },
      entregasFueraDePlazo: {
        total: atrasadas.length,
        items: atrasadas.map(e => ({
          id: e.id,
          entregable: e.entregable?.nombre,
          proyecto: e.entregable?.proyecto?.titulo,
          estudiante: `${e.entregable?.proyecto?.estudiante?.usuario?.nombre || ''} ${e.entregable?.proyecto?.estudiante?.usuario?.apellidoPaterno || ''}`,
          fechaLimite: e.entregable?.fechaLimite,
          diasAtraso: Math.floor((ahora.getTime() - new Date(e.entregable.fechaLimite).getTime()) / (1000 * 60 * 60 * 24)),
        })),
      },
    };
  }

  // ==================== REPORTES DE GESTIÓN (ESTRATÉGICOS) ====================

  /**
   * 1. Indicadores generales del sistema
   * Total de prácticas, tesis y convenios; activos vs finalizados
   */
  async getIndicadoresGenerales(): Promise<any> {
    const [practicas, tesis, convenios, empresas, estudiantes, ofertas] = await Promise.all([
      this.internshipRepo.find({ relations: ['empresa'] }),
      this.thesisRepo.find({ where: { activo: true } }),
      this.agreementRepo.find({ relations: ['empresa'] }),
      this.companyRepo.find(),
      this.studentRepo.find({ relations: ['usuario'] }),
      this.offerRepo.find({ relations: ['empresa'] }),
    ]);

    const practicasActivas = practicas.filter(p => p.estado === InternshipEstado.ACTIVA);
    const practicasFinalizadas = practicas.filter(p => p.estado === InternshipEstado.FINALIZADA);
    const tesisActivas = tesis.filter(t => t.estado !== ThesisEstado.CULMINADO && t.estado !== ThesisEstado.CANCELADO);
    const tesisFinalizadas = tesis.filter(t => t.estado === ThesisEstado.CULMINADO);
    // Calcular convenios vigentes basado en fecha (excluyendo cancelados)
    const conveniosVigentes = convenios.filter(c => 
      normalizarEstadoConvenio(c.estado, c.fechaVencimiento) === EstadoConvenio.VIGENTE
    );

    return {
      practicas: {
        total: practicas.length,
        activas: practicasActivas.length,
        finalizadas: practicasFinalizadas.length,
        porcentajeFinalizadas: practicas.length > 0 ? ((practicasFinalizadas.length / practicas.length) * 100).toFixed(1) : 0,
      },
      tesis: {
        total: tesis.length,
        activas: tesisActivas.length,
        finalizadas: tesisFinalizadas.length,
        porcentajeFinalizadas: tesis.length > 0 ? ((tesisFinalizadas.length / tesis.length) * 100).toFixed(1) : 0,
      },
      convenios: {
        total: convenios.length,
        vigentes: conveniosVigentes.length,
        vencidos: convenios.filter(c => c.estado === EstadoConvenio.VENCIDO).length,
      },
      empresas: {
        total: empresas.length,
        conConvenio: new Set(convenios.map(c => c.empresaId)).size,
      },
      estudiantes: {
        total: estudiantes.length,
        enPractica: new Set(practicasActivas.map(p => p.estudianteId)).size,
        enTesis: new Set(tesisActivas.map(t => t.estudianteId)).size,
      },
      ofertas: {
        total: ofertas.length,
        publicadas: ofertas.filter(o => o.estado === OfertaEstado.PUBLICADA).length,
        cerradas: ofertas.filter(o => o.estado === OfertaEstado.CERRADA).length,
      },
    };
  }

  /**
   * 2. Rendimiento de prácticas
   * % de estudiantes que consiguen prácticas, tiempo promedio de colocación
   */
  async getRendimientoPracticas(): Promise<any> {
    const applications = await this.applicationRepo.find({
      relations: ['estudiante', 'oferta'],
      order: { fechaPostulacion: 'ASC' },
    });

    const internships = await this.internshipRepo.find({
      relations: ['postulacion'],
    });

    // Estudiantes que consiguieron práctica
    const estudiantesConPractica = new Set(internships.map(i => i.estudianteId)).size;
    const totalPostulantes = new Set(applications.map(a => a.estudianteId)).size;

    // Tiempo promedio desde postulación a aprobación
    const tiemposColocacion = applications
      .filter(a => a.estado === ApplicationEstado.APROBADO && a.fechaRevision)
      .map(a => {
        const postulacion = new Date(a.fechaPostulacion).getTime();
        const revision = new Date(a.fechaRevision).getTime();
        return Math.ceil((revision - postulacion) / (1000 * 60 * 60 * 24));
      });

    const promedioDias = tiemposColocacion.length > 0
      ? tiemposColocacion.reduce((a, b) => a + b, 0) / tiemposColocacion.length
      : 0;

    // Por estado de postulación
    const porEstado = {
      postulado: applications.filter(a => a.estado === ApplicationEstado.POSTULADO).length,
      preseleccionado: applications.filter(a => a.estado === ApplicationEstado.PRESELECCIONADO).length,
      aprobado: applications.filter(a => a.estado === ApplicationEstado.APROBADO).length,
      rechazado: applications.filter(a => a.estado === ApplicationEstado.RECHAZADO).length,
    };

    return {
      totalPostulaciones: applications.length,
      tasaColocacion: totalPostulantes > 0 ? ((estudiantesConPractica / totalPostulantes) * 100).toFixed(1) : 0,
      promedioDiasColocacion: promedioDias.toFixed(1),
      porEstado,
      tasaAprobacion: applications.length > 0
        ? ((porEstado.aprobado / applications.length) * 100).toFixed(1)
        : 0,
    };
  }

  /**
   * 3. Participación de empresas
   * Empresas más activas, número de practicantes por empresa
   */
  async getParticipacionEmpresas(): Promise<any> {
    const empresas = await this.companyRepo.find({ relations: ['convenios', 'ofertas'] });
    const internships = await this.internshipRepo.find();
    const agreements = await this.agreementRepo.find();

    const empresasConMetricas = empresas.map(e => {
      const practicantes = internships.filter(i => i.empresaId === e.id).length;
      const ofertasActivas = e.ofertas?.filter(o => o.estado === OfertaEstado.PUBLICADA).length || 0;
      const totalOfertas = e.ofertas?.length || 0;
      const convenios = e.convenios?.length || 0;

      return {
        id: e.id,
        nombre: e.nombreComercial || e.razonSocial,
        ruc: e.ruc,
        practicantes,
        ofertasActivas,
        totalOfertas,
        convenios,
        activa: e.activo,
      };
    });

    // Ordenar por número de practicantes (más activas primero)
    empresasConMetricas.sort((a, b) => b.practicantes - a.practicantes);

    return {
      totalEmpresas: empresas.length,
      empresasActivas: empresas.filter(e => e.activo).length,
      topEmpresas: empresasConMetricas.slice(0, 10),
      empresasSinActividad: empresasConMetricas.filter(e => e.practicantes === 0 && e.totalOfertas === 0).length,
      promedioPracticantesPorEmpresa: empresas.length > 0
        ? (internships.length / empresas.length).toFixed(1)
        : 0,
    };
  }

  /**
   * 4. Rendimiento de tesis
   * % de tesis aprobadas/rechazadas, tiempo promedio de desarrollo
   */
  async getRendimientoTesis(): Promise<any> {
    const tesis = await this.thesisRepo.find({
      relations: ['estudiante', 'estudiante.usuario', 'acta'],
    });

    const sustentaciones = await this.defenseRepo.find();

    const aprobadas = sustentaciones.filter(s => s.resultado === 'aprobado').length;
    const desaprobadas = sustentaciones.filter(s => s.resultado === 'desaprobado').length;

    // Calcular tiempo promedio de desarrollo
    const tiemposDesarrollo = tesis
      .filter(t => t.fechaAprobacion && t.fechaRegistro)
      .map(t => {
        const inicio = new Date(t.fechaRegistro).getTime();
        const fin = new Date(t.fechaAprobacion!).getTime();
        return Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
      });

    const promedioDias = tiemposDesarrollo.length > 0
      ? tiemposDesarrollo.reduce((a, b) => a + b, 0) / tiemposDesarrollo.length
      : 0;

    return {
      totalTesis: tesis.length,
      sustentadas: sustentaciones.length,
      aprobadas,
      desaprobadas,
      tasaAprobacion: sustentaciones.length > 0
        ? ((aprobadas / sustentaciones.length) * 100).toFixed(1)
        : 0,
      promedioDiasDesarrollo: promedioDias.toFixed(0),
      porEstado: {
        en_registro: tesis.filter(t => t.estado === ThesisEstado.EN_REGISTRO).length,
        propuesto: tesis.filter(t => t.estado === ThesisEstado.PROPUESTO).length,
        aprobado: tesis.filter(t => t.estado === ThesisEstado.APROBADO).length,
        en_desarrollo: tesis.filter(t => t.estado === ThesisEstado.EN_DESARROLLO).length,
        en_revision: tesis.filter(t => t.estado === ThesisEstado.EN_REVISION).length,
        culminado: tesis.filter(t => t.estado === ThesisEstado.CULMINADO).length,
        desaprobado: tesis.filter(t => t.estado === ThesisEstado.DESAPROBADO).length,
        cancelado: tesis.filter(t => t.estado === ThesisEstado.CANCELADO).length,
      },
    };
  }

  /**
   * 5. Desempeño de asesores
   * Carga de estudiantes por docente, tiempo de revisión
   */
  async getDesempenoAsesores(): Promise<any> {
    const assignments = await this.assignmentRepo.find({
      relations: ['docente', 'proyecto', 'proyecto.estudiante', 'proyecto.estudiante.usuario'],
    });

    // Obtener IDs únicos de docentes que son asesores o jurados
    const docenteIds = [...new Set(assignments.map(a => a.docenteId))];
    const asesores = docenteIds.length > 0
      ? await this.userRepo.find({ where: { id: In(docenteIds) } })
      : [];

    const asesoresConMetricas = asesores.map(a => {
      const asignaciones = assignments.filter(asg => asg.docenteId === a.id);
      const tesisAsesoradas = asignaciones.filter(asg => asg.tipo === AsignacionTipo.ASESOR);
      const jurados = asignaciones.filter(asg => asg.tipo === AsignacionTipo.JURADO);

      return {
        id: a.id,
        nombre: `${a.nombre} ${a.apellidoPaterno || ''}`,
        email: a.email,
        tesisAsesoradas: tesisAsesoradas.length,
        comoJurado: jurados.length,
        cargaTotal: asignaciones.length,
        activo: a.activo,
      };
    });

    asesoresConMetricas.sort((a, b) => b.cargaTotal - a.cargaTotal);

    return {
      totalAsesores: asesores.length,
      asesoresActivos: asesores.filter(a => a.activo).length,
      promedioTesisPorAsesor: asesores.length > 0
        ? (assignments.filter(a => a.tipo === AsignacionTipo.ASESOR).length / asesores.length).toFixed(1)
        : 0,
      asesores: asesoresConMetricas,
    };
  }

  /**
   * 6. Cumplimiento de plazos
   * Entregas a tiempo vs retrasadas
   */
  async getCumplimientoPlazos(): Promise<any> {
    const submissions = await this.submissionRepo.find({
      relations: ['entregable'],
    });

    const aTiempo = submissions.filter(s => {
      const fechaEntrega = new Date(s.fechaEntrega);
      const fechaLimite = new Date(s.entregable?.fechaLimite);
      return fechaEntrega <= fechaLimite;
    });

    const retrasadas = submissions.filter(s => {
      const fechaEntrega = new Date(s.fechaEntrega);
      const fechaLimite = new Date(s.entregable?.fechaLimite);
      return fechaEntrega > fechaLimite;
    });

    return {
      totalEntregas: submissions.length,
      aTiempo: aTiempo.length,
      retrasadas: retrasadas.length,
      tasaCumplimiento: submissions.length > 0
        ? ((aTiempo.length / submissions.length) * 100).toFixed(1)
        : 0,
      promedioDiasRetraso: retrasadas.length > 0
        ? (retrasadas.reduce((sum, s) => {
            const diff = new Date(s.fechaEntrega).getTime() - new Date(s.entregable.fechaLimite).getTime();
            return sum + Math.ceil(diff / (1000 * 60 * 60 * 24));
          }, 0) / retrasadas.length).toFixed(1)
        : 0,
    };
  }

  /**
   * 7. Evolución temporal
   * Prácticas y tesis por periodo (mes/año)
   */
  async getEvolucionTemporal(filters?: ReportFilters): Promise<any> {
    const fechaDesde = filters?.fechaDesde ? new Date(filters.fechaDesde) : new Date('2020-01-01');
    const fechaHasta = filters?.fechaHasta ? new Date(filters.fechaHasta) : new Date();

    const [practicas, tesis, ofertas, postulaciones] = await Promise.all([
      this.internshipRepo.find({
        where: { creadoEn: Between(fechaDesde, fechaHasta) },
      }),
      this.thesisRepo.find({
        where: { fechaRegistro: Between(fechaDesde, fechaHasta) },
      }),
      this.offerRepo.find({
        where: { creadoEn: Between(fechaDesde, fechaHasta) },
      }),
      this.applicationRepo.find({
        where: { fechaPostulacion: Between(fechaDesde, fechaHasta) },
      }),
    ]);

    return {
      periodo: {
        desde: fechaDesde.toISOString().split('T')[0],
        hasta: fechaHasta.toISOString().split('T')[0],
      },
      practicasPorMes: this.groupByMonth(practicas.map(p => p.creadoEn)),
      tesisPorMes: this.groupByMonth(tesis.map(t => t.fechaRegistro)),
      ofertasPorMes: this.groupByMonth(ofertas.map(o => o.creadoEn)),
      postulacionesPorMes: this.groupByMonth(postulaciones.map(p => p.fechaPostulacion)),
      totales: {
        practicas: practicas.length,
        tesis: tesis.length,
        ofertas: ofertas.length,
        postulaciones: postulaciones.length,
      },
    };
  }

  /**
   * 8. Estado de convenios
   * Convenios activos vs vencidos
   */
  async getEstadoConvenios(): Promise<any> {
    const convenios = await this.agreementRepo.find({
      relations: ['empresa'],
    });

    const ahora = new Date();
    
    // Calcular estado real para cada convenio (normaliza estados antiguos como 'renovado')
    const conveniosConEstadoReal = convenios.map(c => ({
      ...c,
      estadoReal: normalizarEstadoConvenio(c.estado, c.fechaVencimiento),
    }));

    // Convenios por vencer (vigentes que vencen en 60 días o menos)
    const porVencer = conveniosConEstadoReal.filter(c => {
      const diasRestantes = Math.ceil((new Date(c.fechaVencimiento).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      return c.estadoReal === EstadoConvenio.VIGENTE && diasRestantes <= 60 && diasRestantes > 0;
    });

    // Calcular conteos por estado (solo estados válidos del nuevo enum)
    const conteoPorEstado = {
      vigente: conveniosConEstadoReal.filter(c => c.estadoReal === EstadoConvenio.VIGENTE).length,
      vencido: conveniosConEstadoReal.filter(c => c.estadoReal === EstadoConvenio.VENCIDO).length,
      cancelado: conveniosConEstadoReal.filter(c => c.estadoReal === EstadoConvenio.CANCELADO).length,
    };

    return {
      total: convenios.length,
      porEstado: conteoPorEstado,
      porTipo: {
        marco: convenios.filter(c => c.tipo === 'marco').length,
        especifico: convenios.filter(c => c.tipo === 'especifico').length,
      },
      porVencer60Dias: porVencer.length,
      conveniosPorEmpresa: conveniosConEstadoReal.map(c => {
        const diasRestantes = Math.ceil((new Date(c.fechaVencimiento).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: c.id,
          empresa: c.empresa?.razonSocial || c.empresa?.nombreComercial,
          estado: c.estadoReal, // Usar estado calculado, no el almacenado
          estadoAlmacenado: c.estado, // Mostrar también el estado en BD para debug
          tipo: c.tipo,
          fechaInicio: c.fechaInicio,
          fechaVencimiento: c.fechaVencimiento,
          diasRestantes: diasRestantes > 0 ? diasRestantes : 0,
        };
      }),
    };
  }

  private renderTemplate(templateName: string, data: any): string {
    const logoBase64 = this.getLogoBase64();
    const logoHtml = logoBase64 ? `<img src="${logoBase64}" alt="Logo UNT" />` : '<div style="width:56px;height:56px;background:#1e40af;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border-radius:8px;">UNT</div>';
    const commonStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          padding: 0; 
          color: #1a1a2e; 
          line-height: 1.6; 
          background: #fafbfc;
        }
        
        /* Header Institucional */
        .institutional-header {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .logo-section {
          flex-shrink: 0;
        }
        
        .logo-section img {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }
        
        .header-content {
          flex: 1;
        }
        
        .header-content h1 {
          font-size: 13px;
          font-weight: 600;
          color: #1e40af;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        
        .header-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        
        .header-meta {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }
        
        .header-meta .date {
          font-weight: 500;
          color: #334155;
        }
        
        /* Main Content */
        .main-content {
          padding: 28px 32px;
        }
        
        /* Report Title */
        .report-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #1e40af;
          display: inline-block;
        }
        
        h2 { 
          font-size: 14px; 
          font-weight: 600;
          color: #334155; 
          margin: 24px 0 12px 0; 
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        h3 { 
          font-size: 13px; 
          font-weight: 600;
          color: #475569; 
          margin: 16px 0 10px 0; 
        }
        
        /* Summary Cards - Modern Style */
        .summary { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin: 20px 0 28px 0; 
        }
        
        .summary-item { 
          background: #ffffff;
          padding: 20px 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          transition: transform 0.2s ease;
        }
        
        .summary-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .summary-value { 
          font-size: 32px; 
          font-weight: 700; 
          color: #1e40af;
          line-height: 1.2;
        }
        
        .summary-label { 
          font-size: 11px; 
          font-weight: 500;
          color: #64748b; 
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-top: 6px;
        }
        
        /* Table - Clean Modern */
        table { 
          width: 100%; 
          border-collapse: separate;
          border-spacing: 0;
          margin-top: 16px; 
          font-size: 12px;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        
        th { 
          background: #f8fafc;
          color: #475569;
          padding: 14px 12px;
          text-align: left; 
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        td { 
          padding: 12px; 
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        tr:nth-child(even) { 
          background: #fafbfc; 
        }
        
        tr:hover { 
          background: #f1f5f9; 
        }
        
        /* Badges - Refined */
        .badge { 
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        .badge-activa, .badge-aprobado, .badge-entregado { 
          background: #dcfce7; 
          color: #166534; 
        }
        
        .badge-finalizada, .badge-culminado { 
          background: #dbeafe; 
          color: #1e40af; 
        }
        
        .badge-pendiente, .badge-postulado { 
          background: #fef3c7; 
          color: #92400e; 
        }
        
        .badge-observado, .badge-vencido, .badge-rechazado { 
          background: #fee2e2; 
          color: #991b1b; 
        }
        
        .badge-en_desarrollo, .badge-revisando { 
          background: #e0e7ff; 
          color: #3730a3; 
        }
        
        /* Alert Styles */
        .alert { 
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .alert-warning { 
          background: #fef3c7; 
          color: #92400e; 
        }
        
        .alert-danger { 
          background: #fee2e2; 
          color: #991b1b; 
        }
        
        .alert-success { 
          background: #dcfce7; 
          color: #166534; 
        }
        
        .section { 
          margin: 24px 0; 
        }
        
        /* Grid Cards */
        .grid-4 { 
          display: grid; 
          grid-template-columns: repeat(4, 1fr); 
          gap: 16px; 
        }
        
        .grid-3 { 
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 16px; 
        }
        
        .card { 
          background: #ffffff;
          padding: 20px 16px;
          border-radius: 10px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        
        .card-value { 
          font-size: 28px; 
          font-weight: 700; 
          color: #1e40af;
          margin-bottom: 4px;
        }
        
        .card-label { 
          font-size: 11px; 
          font-weight: 500;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        
        /* Progress Bar */
        .progress-bar { 
          background: #e2e8f0;
          border-radius: 10px;
          height: 6px;
          overflow: hidden;
        }
        
        .progress-fill { 
          background: linear-gradient(90deg, #3b82f6, #1e40af);
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s ease;
        }
        
        /* Text Utilities */
        .text-muted { 
          color: #64748b; 
        }
        
        .text-small { 
          font-size: 11px; 
        }
        
        /* Empty State */
        .empty-state { 
          text-align: center; 
          padding: 48px 24px; 
          color: #94a3b8;
          font-size: 14px;
          background: #f8fafc;
          border-radius: 10px;
          border: 1px dashed #e2e8f0;
        }
        
        /* Footer */
        .report-footer {
          margin-top: 40px;
          padding: 16px 32px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          background: #ffffff;
        }
      </style>
    `;

    const headerHtml = `
      <div class="institutional-header">
        <div class="logo-section">
          ${logoHtml}
        </div>
        <div class="header-content">
          <h1>Universidad Nacional de Trujillo</h1>
          <h2>Sistema de Gestión de Prácticas y Tesis</h2>
        </div>
        <div class="header-meta">
          <div class="date">${data.fecha}</div>
        </div>
      </div>
    `;
    const footerHtml = `
      <div class="report-footer">
        Universidad Nacional de Trujillo - Reporte generado el ${data.fecha}
      </div>
    `;

    const templates: Record<string, string> = {
      'practicas-en-curso': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Prácticas en Curso</h1>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item">
                  <div class="summary-value">{{total}}</div>
                  <div class="summary-label">Total Prácticas</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{horasAcumuladasTotal}}</div>
                  <div class="summary-label">Horas Acumuladas</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{promedioHorasCompletadas}}</div>
                  <div class="summary-label">Promedio Horas</div>
                </div>
              </div>
            </div>
            {{#if items.length}}
            <table>
              <tr>
                <th>Estudiante</th>
                <th>Código</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Horas</th>
                <th>Progreso</th>
                <th>Asesor</th>
              </tr>
              {{#each items}}
              <tr>
                <td>{{estudiante}}</td>
                <td>{{codigoUniversitario}}</td>
                <td>{{empresa}}</td>
                <td><span class="badge badge-{{estado}}">{{estado}}</span></td>
                <td>{{horasCompletadas}}/{{horasTotalesRequeridas}}</td>
                <td>
                  <div class="progress-bar" style="width: 60px;">
                    <div class="progress-fill" style="width: {{progreso}}%;"></div>
                  </div>
                  <span class="text-small">{{progreso}}%</span>
                </td>
                <td>{{asesorAcademico}}</td>
              </tr>
              {{/each}}
            </table>
            {{else}}
            <div class="empty-state">No hay prácticas en curso para mostrar</div>
            {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'postulaciones': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Postulaciones a Prácticas</h1>
              <div class="summary">
                <div class="summary-item">
                  <div class="summary-value">{{totalOfertas}}</div>
                  <div class="summary-label">Total Ofertas</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{totalPostulaciones}}</div>
                  <div class="summary-label">Total Postulaciones</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{porEstado.aprobado}}</div>
                  <div class="summary-label">Aprobadas</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{porEstado.rechazado}}</div>
                  <div class="summary-label">Rechazadas</div>
                </div>
              </div>
              <h2>Distribución por Estado</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{porEstado.postulado}}</div><div class="card-label">Postulado</div></div>
                <div class="card"><div class="card-value">{{porEstado.preseleccionado}}</div><div class="card-label">Preseleccionado</div></div>
                <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
                <div class="card"><div class="card-value">{{porEstado.rechazado}}</div><div class="card-label">Rechazado</div></div>
              </div>
              {{#if ofertas.length}}
              <h2>Detalle de Ofertas</h2>
              <table>
                <tr><th>Título</th><th>Empresa</th><th>Cupos</th><th>Postulantes</th><th>Estado</th></tr>
                {{#each ofertas}}
                <tr>
                  <td>{{titulo}}</td>
                  <td>{{empresa}}</td>
                  <td>{{cupos}}</td>
                  <td>{{postulantes}}</td>
                  <td><span class="badge badge-{{estado}}">{{estado}}</span></td>
                </tr>
                {{/each}}
              </table>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'seguimiento-tesis': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Seguimiento de Tesis</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Proyectos</div></div>
                <div class="summary-item"><div class="summary-value">{{conAtrasos}}</div><div class="summary-label">Con Atrasos</div></div>
                <div class="summary-item"><div class="summary-value">{{sinAsesor}}</div><div class="summary-label">Sin Asesor</div></div>
              </div>
              <h2>Distribución por Estado</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{porEstado.en_registro}}</div><div class="card-label">En Registro</div></div>
                <div class="card"><div class="card-value">{{porEstado.propuesto}}</div><div class="card-label">Propuesto</div></div>
                <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
                <div class="card"><div class="card-value">{{porEstado.en_desarrollo}}</div><div class="card-label">En Desarrollo</div></div>
              </div>
              {{#if items.length}}
              <h2>Detalle de Proyectos</h2>
              <table>
                <tr><th>Título</th><th>Estudiante</th><th>Área</th><th>Estado</th><th>Asesor</th><th>Entregables</th><th>Pendientes</th><th>Atrasados</th></tr>
                {{#each items}}
                <tr>
                  <td>{{titulo}}</td>
                  <td>{{estudiante}}</td>
                  <td>{{area}}</td>
                  <td><span class="badge badge-{{estado}}">{{estado}}</span></td>
                  <td>{{#if asesor}}{{asesor}}{{else}}<span class="alert alert-danger">Sin asignar</span>{{/if}}</td>
                  <td>{{totalEntregables}}</td>
                  <td>{{#if entregablesPendientes}}<span class="alert alert-warning">{{entregablesPendientes}}</span>{{else}}0{{/if}}</td>
                  <td>{{#if entregablesAtrasados}}<span class="alert alert-danger">{{entregablesAtrasados}}</span>{{else}}0{{/if}}</td>
                </tr>
                {{/each}}
              </table>
              {{else}}
              <div class="empty-state">No hay proyectos de tesis para mostrar</div>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'evaluaciones': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Evaluaciones y Aprobaciones</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{totalEvaluado}}</div><div class="summary-label">Total Evaluado</div></div>
                <div class="summary-item"><div class="summary-value">{{pendientesRevision}}</div><div class="summary-label">Pendientes</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaAprobacion}}%</div><div class="summary-label">Tasa Aprobación</div></div>
              </div>
              <h2>Distribución por Estado</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{porEstado.entregado}}</div><div class="card-label">Entregado</div></div>
                <div class="card"><div class="card-value">{{porEstado.revisando}}</div><div class="card-label">Revisando</div></div>
                <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
                <div class="card"><div class="card-value">{{porEstado.observado}}</div><div class="card-label">Observado</div></div>
              </div>
              {{#if itemsPendientes.length}}
              <h2>Entregas Pendientes de Revisión</h2>
              <table>
                <tr><th>Entrega</th><th>Entregable</th><th>Proyecto</th><th>Estudiante</th><th>Fecha</th><th>Días Pend.</th></tr>
                {{#each itemsPendientes}}
                <tr>
                  <td>{{tituloEntrega}}</td>
                  <td>{{entregable}}</td>
                  <td>{{proyecto}}</td>
                  <td>{{estudiante}}</td>
                  <td>{{fechaEntrega}}</td>
                  <td><span class="alert alert-warning">{{diasPendientes}}</span></td>
                </tr>
                {{/each}}
              </table>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'sustentaciones': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Sustentaciones Programadas</h1>
              <div class="summary">
                <div class="summary-item">
                  <div class="summary-value">{{total}}</div>
                  <div class="summary-label">Total Sustentaciones</div>
                </div>
              </div>
              {{#if items.length}}
              <table>
                <tr><th>Fecha</th><th>Hora</th><th>Lugar</th><th>Proyecto</th><th>Estudiante</th><th>Jurados</th><th>Resultado</th></tr>
                {{#each items}}
                <tr>
                  <td>{{fecha}}</td>
                  <td>{{horaInicio}}-{{horaFin}}</td>
                  <td>{{lugar}}</td>
                  <td>{{proyecto}}</td>
                  <td>{{estudiante}}</td>
                  <td>{{#each jurados}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}</td>
                  <td>{{#if resultado}}<span class="badge badge-{{resultado}}">{{resultado}}</span>{{else}}<span class="text-muted">Pendiente</span>{{/if}}</td>
                </tr>
                {{/each}}
              </table>
              {{else}}
              <div class="empty-state">No hay sustentaciones programadas</div>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'convenios': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Convenios Activos</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Convenios</div></div>
                <div class="summary-item"><div class="summary-value">{{porVencer30Dias}}</div><div class="summary-label">Vencen <30 días</div></div>
                <div class="summary-item"><div class="summary-value">{{porVencer60Dias}}</div><div class="summary-label">Vencen <60 días</div></div>
              </div>
              {{#if items.length}}
              <table>
                <tr><th>Empresa</th><th>Tipo</th><th>Inicio</th><th>Vencimiento</th><th>Días Rest.</th><th>Alerta</th></tr>
                {{#each items}}
                <tr>
                  <td>{{empresa}}</td>
                  <td>{{tipo}}</td>
                  <td>{{fechaInicio}}</td>
                  <td>{{fechaVencimiento}}</td>
                  <td>{{diasRestantes}}</td>
                  <td>
                    {{#if alerta}}
                      {{#if (eq alerta 'critica')}}<span class="alert alert-danger">Crítica</span>
                      {{else}}<span class="alert alert-warning">Advertencia</span>{{/if}}
                    {{else}}<span class="alert alert-success">Normal</span>
                    {{/if}}
                  </td>
                </tr>
                {{/each}}
              </table>
              {{else}}
              <div class="empty-state">No hay convenios activos</div>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'alertas': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Alertas Operativas</h1>
              <div class="section">
                <h2>Convenios por Vencer ({{conveniosPorVencer.total}})</h2>
                {{#if conveniosPorVencer.items.length}}
                <table>
                  <tr><th>Empresa</th><th>Vencimiento</th><th>Días Restantes</th></tr>
                  {{#each conveniosPorVencer.items}}
                  <tr><td>{{empresa}}</td><td>{{fechaVencimiento}}</td><td><span class="alert alert-danger">{{diasRestantes}}</span></td></tr>
                  {{/each}}
                </table>
                {{else}}<p class="text-muted">No hay convenios por vencer</p>{{/if}}
              </div>
              <div class="section">
                <h2>Estudiantes Sin Avance ({{estudiantesSinAvance.total}})</h2>
                {{#if estudiantesSinAvance.items.length}}
                <table>
                  <tr><th>Estudiante</th><th>Empresa</th><th>Horas</th><th>Progreso</th></tr>
                  {{#each estudiantesSinAvance.items}}
                  <tr>
                    <td>{{estudiante}}</td><td>{{empresa}}</td><td>{{horasCompletadas}}/{{horasRequeridas}}</td>
                    <td><span class="alert alert-warning">{{progreso}}%</span></td>
                  </tr>
                  {{/each}}
                </table>
                {{else}}<p class="text-muted">No hay estudiantes sin avance</p>{{/if}}
              </div>
              <div class="section">
                <h2>Entregas Fuera de Plazo ({{entregasFueraDePlazo.total}})</h2>
                {{#if entregasFueraDePlazo.items.length}}
                <table>
                  <tr><th>Entregable</th><th>Proyecto</th><th>Estudiante</th><th>Fecha Límite</th><th>Días Atraso</th></tr>
                  {{#each entregasFueraDePlazo.items}}
                  <tr>
                    <td>{{entregable}}</td><td>{{proyecto}}</td><td>{{estudiante}}</td>
                    <td>{{fechaLimite}}</td><td><span class="alert alert-danger">{{diasAtraso}}</span></td>
                  </tr>
                  {{/each}}
                </table>
                {{else}}<p class="text-muted">No hay entregas fuera de plazo</p>{{/if}}
              </div>
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'indicadores-generales': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Indicadores Generales</h1>
              <h2>Prácticas</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{practicas.total}}</div><div class="card-label">Total</div></div>
                <div class="card"><div class="card-value">{{practicas.activas}}</div><div class="card-label">Activas</div></div>
                <div class="card"><div class="card-value">{{practicas.finalizadas}}</div><div class="card-label">Finalizadas</div></div>
                <div class="card"><div class="card-value">{{practicas.porcentajeFinalizadas}}%</div><div class="card-label">% Finalizadas</div></div>
              </div>
              <h2>Tesis</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{tesis.total}}</div><div class="card-label">Total</div></div>
                <div class="card"><div class="card-value">{{tesis.activas}}</div><div class="card-label">Activas</div></div>
                <div class="card"><div class="card-value">{{tesis.finalizadas}}</div><div class="card-label">Finalizadas</div></div>
                <div class="card"><div class="card-value">{{tesis.porcentajeFinalizadas}}%</div><div class="card-label">% Finalizadas</div></div>
              </div>
              <h2>Convenios y Empresas</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{convenios.total}}</div><div class="card-label">Convenios</div></div>
                <div class="card"><div class="card-value">{{convenios.vigentes}}</div><div class="card-label">Vigentes</div></div>
                <div class="card"><div class="card-value">{{empresas.total}}</div><div class="card-label">Empresas</div></div>
                <div class="card"><div class="card-value">{{empresas.conConvenio}}</div><div class="card-label">Con Convenio</div></div>
              </div>
              <h2>Estudiantes</h2>
              <div class="grid-3">
                <div class="card"><div class="card-value">{{estudiantes.total}}</div><div class="card-label">Total</div></div>
                <div class="card"><div class="card-value">{{estudiantes.enPractica}}</div><div class="card-label">En Práctica</div></div>
                <div class="card"><div class="card-value">{{estudiantes.enTesis}}</div><div class="card-label">En Tesis</div></div>
              </div>
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'rendimiento-practicas': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Rendimiento de Prácticas</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{tasaColocacion}}%</div><div class="summary-label">Tasa Colocación</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioDiasColocacion}}</div><div class="summary-label">Días Promedio</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaAprobacion}}%</div><div class="summary-label">Tasa Aprobación</div></div>
                <div class="summary-item"><div class="summary-value">{{totalPostulaciones}}</div><div class="summary-label">Total Postulaciones</div></div>
              </div>
              <h2>Distribución por Estado</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{porEstado.postulado}}</div><div class="card-label">Postulado</div></div>
                <div class="card"><div class="card-value">{{porEstado.preseleccionado}}</div><div class="card-label">Preseleccionado</div></div>
                <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
                <div class="card"><div class="card-value">{{porEstado.rechazado}}</div><div class="card-label">Rechazado</div></div>
              </div>
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'participacion-empresas': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Participación de Empresas</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{totalEmpresas}}</div><div class="summary-label">Total Empresas</div></div>
                <div class="summary-item"><div class="summary-value">{{empresasActivas}}</div><div class="summary-label">Empresas Activas</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioPracticantesPorEmpresa}}</div><div class="summary-label">Promedio Practicantes</div></div>
                <div class="summary-item"><div class="summary-value">{{empresasSinActividad}}</div><div class="summary-label">Sin Actividad</div></div>
              </div>
              {{#if topEmpresas.length}}
              <h2>Top Empresas por Practicantes</h2>
              <table>
                <tr><th>Empresa</th><th>RUC</th><th>Practicantes</th><th>Ofertas Activas</th><th>Convenios</th></tr>
                {{#each topEmpresas}}
                <tr>
                  <td>{{nombre}}</td>
                  <td>{{ruc}}</td>
                  <td>{{practicantes}}</td>
                  <td>{{ofertasActivas}}</td>
                  <td>{{convenios}}</td>
                </tr>
                {{/each}}
              </table>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'rendimiento-tesis': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Rendimiento de Tesis</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{totalTesis}}</div><div class="summary-label">Total Tesis</div></div>
                <div class="summary-item"><div class="summary-value">{{sustentadas}}</div><div class="summary-label">Sustentadas</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaAprobacion}}%</div><div class="summary-label">Tasa Aprobación</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioDiasDesarrollo}}</div><div class="summary-label">Días Promedio</div></div>
              </div>
              <h2>Distribución por Estado</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{porEstado.en_registro}}</div><div class="card-label">En Registro</div></div>
                <div class="card"><div class="card-value">{{porEstado.propuesto}}</div><div class="card-label">Propuesto</div></div>
                <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
                <div class="card"><div class="card-value">{{porEstado.en_desarrollo}}</div><div class="card-label">En Desarrollo</div></div>
              </div>
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'desempeno-asesores': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Desempeño de Asesores</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{totalAsesores}}</div><div class="summary-label">Total Asesores</div></div>
                <div class="summary-item"><div class="summary-value">{{asesoresActivos}}</div><div class="summary-label">Asesores Activos</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioTesisPorAsesor}}</div><div class="summary-label">Promedio Tesis/Asesor</div></div>
              </div>
              {{#if asesores.length}}
              <h2>Detalle por Asesor</h2>
              <table>
                <tr><th>Nombre</th><th>Email</th><th>Tesis Asesoradas</th><th>Como Jurado</th><th>Carga Total</th><th>Estado</th></tr>
                {{#each asesores}}
                <tr>
                  <td>{{nombre}}</td>
                  <td>{{email}}</td>
                  <td>{{tesisAsesoradas}}</td>
                  <td>{{comoJurado}}</td>
                  <td>{{cargaTotal}}</td>
                  <td><span class="badge badge-{{#if activo}}aprobado{{else}}rechazado{{/if}}">{{#if activo}}Activo{{else}}Inactivo{{/if}}</span></td>
                </tr>
                {{/each}}
              </table>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'cumplimiento-plazos': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Cumplimiento de Plazos</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{totalEntregas}}</div><div class="summary-label">Total Entregas</div></div>
                <div class="summary-item"><div class="summary-value">{{aTiempo}}</div><div class="summary-label">A Tiempo</div></div>
                <div class="summary-item"><div class="summary-value">{{retrasadas}}</div><div class="summary-label">Retrasadas</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaCumplimiento}}%</div><div class="summary-label">Tasa Cumplimiento</div></div>
              </div>
              <div style="margin-top: 20px;">
                <h3>Días Promedio de Retraso: {{promedioDiasRetraso}}</h3>
                <div class="progress-bar" style="margin-top: 10px; height: 20px;">
                  <div class="progress-fill" style="width: {{tasaCumplimiento}}%;"></div>
                </div>
              </div>
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'evolucion-temporal': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Evolución Temporal</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{totales.practicas}}</div><div class="summary-label">Prácticas</div></div>
                <div class="summary-item"><div class="summary-value">{{totales.tesis}}</div><div class="summary-label">Tesis</div></div>
                <div class="summary-item"><div class="summary-value">{{totales.ofertas}}</div><div class="summary-label">Ofertas</div></div>
                <div class="summary-item"><div class="summary-value">{{totales.postulaciones}}</div><div class="summary-label">Postulaciones</div></div>
              </div>
              <p class="text-muted">Período: {{periodo.desde}} - {{periodo.hasta}}</p>
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'estado-convenios': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            ${headerHtml}
            <div class="main-content">
              <h1 class="report-title">Estado de Convenios</h1>
              <div class="summary">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Convenios</div></div>
                <div class="summary-item"><div class="summary-value">{{porEstado.vigente}}</div><div class="summary-label">Vigentes</div></div>
                <div class="summary-item"><div class="summary-value">{{porEstado.vencido}}</div><div class="summary-label">Vencidos</div></div>
                <div class="summary-item"><div class="summary-value">{{porVencer60Dias}}</div><div class="summary-label">Por Vencer <60d</div></div>
              </div>
              <h2>Por Tipo</h2>
              <div class="grid-4">
                <div class="card"><div class="card-value">{{porTipo.marco}}</div><div class="card-label">Marco</div></div>
                <div class="card"><div class="card-value">{{porTipo.especifico}}</div><div class="card-label">Específico</div></div>
              </div>
              {{#if conveniosPorEmpresa.length}}
              <h2>Detalle por Empresa</h2>
              <table>
                <tr><th>Empresa</th><th>Estado</th><th>Tipo</th><th>Inicio</th><th>Vencimiento</th><th>Días Rest.</th></tr>
                {{#each conveniosPorEmpresa}}
                <tr>
                  <td>{{empresa}}</td>
                  <td><span class="badge badge-{{estado}}">{{estado}}</span></td>
                  <td>{{tipo}}</td>
                  <td>{{fechaInicio}}</td>
                  <td>{{fechaVencimiento}}</td>
                  <td>{{diasRestantes}}</td>
                </tr>
                {{/each}}
              </table>
              {{/if}}
            </div>
            ${footerHtml}
          </body>
        </html>
      `,

      'internship-report': `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Reporte de Prácticas</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #1e40af; }
              .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { background: #1e40af; color: white; padding: 10px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
              tr:nth-child(even) { background: #f9fafb; }
              .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .badge-activa { background: #dcfce7; color: #166534; }
              .badge-finalizada { background: #dbeafe; color: #1e40af; }
            </style>
          </head>
          <body>
            <h1>Reporte de Prácticas Preprofesionales</h1>
            <p>Fecha: {{fecha}}</p>
            <div class="summary">
              <p><strong>Total prácticas:</strong> {{total}}</p>
              <p><strong>Horas acumuladas:</strong> {{horasAcumuladasTotal}}</p>
              <p><strong>Promedio horas por práctica:</strong> {{promedioHorasCompletadas}}</p>
            </div>
            <h2>Detalle de Prácticas</h2>
            <table>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Código</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Horas</th>
                <th>Progreso</th>
                <th>Asesor</th>
              </tr>
              {{#each items}}
              <tr>
                <td>{{id}}</td>
                <td>{{estudiante}}</td>
                <td>{{codigoUniversitario}}</td>
                <td>{{empresa}}</td>
                <td><span class="badge badge-{{estado}}">{{estado}}</span></td>
                <td>{{horasCompletadas}}/{{horasTotalesRequeridas}}</td>
                <td>{{progreso}}%</td>
                <td>{{asesorAcademico}}</td>
              </tr>
              {{/each}}
            </table>
          </body>
        </html>
      `,
      'thesis-report': `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Reporte de Tesis</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #7c3aed; }
              .summary { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
              .estados { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 15px 0; }
              .estado-box { background: #fafafa; padding: 10px; border-radius: 6px; text-align: center; }
              .estado-box .count { font-size: 24px; font-weight: bold; color: #7c3aed; }
              .estado-box .label { font-size: 12px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; }
              th { background: #7c3aed; color: white; padding: 10px; text-align: left; }
              td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
              tr:nth-child(even) { background: #f9fafb; }
              .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .badge-en_registro { background: #fef3c7; color: #92400e; }
              .badge-propuesto { background: #dbeafe; color: #1e40af; }
              .badge-aprobado { background: #dcfce7; color: #166534; }
              .badge-en_desarrollo { background: #e0e7ff; color: #3730a3; }
              .badge-en_revision { background: #fce7f3; color: #9d174d; }
              .alert { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
              .alert-sinAsesor { background: #fee2e2; color: #991b1b; }
              .alert-atrasos { background: #fef3c7; color: #92400e; }
            </style>
          </head>
          <body>
            <h1>Reporte de Proyectos de Tesis</h1>
            <p>Fecha: {{fecha}}</p>
            <div class="summary">
              <p><strong>Total proyectos:</strong> {{total}}</p>
              <p><strong>Con atrasos:</strong> {{conAtrasos}} | <strong>Sin asesor:</strong> {{sinAsesor}}</p>
            </div>
            <h3>Distribución por Estado</h3>
            <div class="estados">
              <div class="estado-box"><div class="count">{{porEstado.en_registro}}</div><div class="label">En Registro</div></div>
              <div class="estado-box"><div class="count">{{porEstado.propuesto}}</div><div class="label">Propuesto</div></div>
              <div class="estado-box"><div class="count">{{porEstado.aprobado}}</div><div class="label">Aprobado</div></div>
              <div class="estado-box"><div class="count">{{porEstado.en_desarrollo}}</div><div class="label">En Desarrollo</div></div>
            </div>
            <h2>Detalle de Proyectos</h2>
            <table>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Estudiante</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Asesor</th>
                <th>Entregables</th>
                <th>Pendientes</th>
                <th>Atrasados</th>
              </tr>
              {{#each items}}
              <tr>
                <td>{{id}}</td>
                <td>{{titulo}}</td>
                <td>{{estudiante}}</td>
                <td>{{area}}</td>
                <td><span class="badge badge-{{estado}}">{{estado}}</span></td>
                <td>{{#if asesor}}{{asesor}}{{else}}<span class="alert alert-sinAsesor">Sin asignar</span>{{/if}}</td>
                <td>{{totalEntregables}}</td>
                <td>{{#if entregablesPendientes}}<span class="alert alert-atrasos">{{entregablesPendientes}}</span>{{else}}0{{/if}}</td>
                <td>{{#if entregablesAtrasados}}<span class="alert alert-atrasos">{{entregablesAtrasados}}</span>{{else}}0{{/if}}</td>
              </tr>
              {{/each}}
            </table>
          </body>
        </html>
      `,
    };
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });
    const compiled = handlebars.compile(templates[templateName]);
    return compiled(data);
  }

  async generatePDF(html: string): Promise<Buffer> {
    const launchOptions: any = {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      headless: true,
    };

    // Usar Chromium del sistema si está disponible (Docker)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '20px', bottom: '20px' } });
    await browser.close();
    return Buffer.from(pdf);
  }

  renderFacultyTemplate(templateName: string, data: any): string {
    const logoBase64 = this.getLogoBase64();
    const logoHtml = logoBase64 ? `<img src="${logoBase64}" alt="Logo UNT" />` : '<div style="width:56px;height:56px;background:#1e40af;color:white;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border-radius:8px;">UNT</div>';
    const commonStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 0;
          color: #1a1a2e;
          line-height: 1.6;
          background: #fafbfc;
        }
        
        /* Header Institucional */
        .institutional-header {
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
          padding: 24px 32px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 20px;
        }
        
        .logo-section {
          flex-shrink: 0;
        }
        
        .logo-section img {
          width: 56px;
          height: 56px;
          object-fit: contain;
        }
        
        .header-content {
          flex: 1;
        }
        
        .header-content h1 {
          font-size: 13px;
          font-weight: 600;
          color: #1e40af;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        
        .header-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }
        
        .header-content h3 {
          font-size: 12px;
          font-weight: 500;
          color: #64748b;
          margin-top: 2px;
        }
        
        .header-meta {
          text-align: right;
          font-size: 12px;
          color: #64748b;
        }
        
        .header-meta .date {
          font-weight: 500;
          color: #334155;
        }
        
        /* Main Content */
        .main-content {
          padding: 28px 32px;
        }
        
        /* Report Title */
        .report-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 2px solid #1e40af;
          display: inline-block;
        }
        
        /* Summary Cards */
        .summary { 
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin: 20px 0 28px 0;
        }
        
        .summary-item { 
          background: #ffffff;
          padding: 20px 16px;
          border-radius: 12px;
          text-align: center;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
        }
        
        .summary-value { 
          font-size: 28px; 
          font-weight: 700; 
          color: #1e40af;
          line-height: 1.2;
        }
        
        .summary-label { 
          font-size: 11px; 
          font-weight: 500;
          color: #64748b; 
          text-transform: uppercase;
          letter-spacing: 0.4px;
          margin-top: 6px;
        }
        
        /* Section Title */
        .section-title { 
          font-size: 14px;
          font-weight: 600;
          margin: 24px 0 12px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: #334155;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 8px;
        }
        
        /* Table */
        table { 
          width: 100%; 
          border-collapse: separate;
          border-spacing: 0;
          margin: 16px 0;
          font-size: 12px;
          background: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        
        th { 
          background: #f8fafc;
          color: #475569;
          padding: 14px 12px;
          text-align: left;
          font-weight: 600;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          border-bottom: 1px solid #e2e8f0;
        }
        
        td { 
          padding: 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #334155;
        }
        
        tr:last-child td {
          border-bottom: none;
        }
        
        tr:nth-child(even) { 
          background: #fafbfc; 
        }
        
        /* Empty State */
        .no-data { 
          text-align: center; 
          padding: 48px 24px;
          color: #94a3b8;
          font-size: 14px;
          font-style: italic;
        }
        
        /* Footer */
        .footer { 
          margin-top: 40px;
          padding: 16px 32px;
          border-top: 1px solid #e2e8f0;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          background: #ffffff;
        }
      </style>
    `;

    const header = `
      <div class="institutional-header">
        <div class="logo-section">
          ${logoHtml}
        </div>
        <div class="header-content">
          <h1>Universidad Nacional de Trujillo</h1>
          <h2>${this.getReportTitle(templateName)} - ${data.facultadNombre || 'Facultad'}</h2>
          <h3>Sistema de Gestión de Prácticas y Tesis</h3>
        </div>
        <div class="header-meta">
          <div class="date">${data.fecha || new Date().toLocaleDateString('es-PE')}</div>
          ${data.facultadId ? `<div>Facultad ID: ${data.facultadId}</div>` : ''}
        </div>
      </div>
    `;

    switch (templateName) {
      case 'internships':
        return this.generateInternshipsTemplate(data, commonStyles, header);
      case 'thesis':
        return this.generateThesisTemplate(data, commonStyles, header);
      case 'students':
        return this.generateStudentsTemplate(data, commonStyles, header);
      case 'advisors':
        return this.generateAdvisorsTemplate(data, commonStyles, header);
      case 'agreements':
        return this.generateAgreementsTemplate(data, commonStyles, header);
      case 'stats':
        return this.generateStatsTemplate(data, commonStyles, header);
      default:
        throw new Error(`Plantilla de facultad no soportada: ${templateName}`);
    }
  }

  private getReportTitle(templateName: string): string {
    const titles: Record<string, string> = {
      'internships': 'PRÁCTICAS PROFESIONALES',
      'thesis': 'PROYECTOS DE TESIS',
      'students': 'ESTUDIANTES',
      'advisors': 'ASESORES ACADÉMICOS',
      'agreements': 'CONVENIOS EMPRESARIALES',
      'stats': 'ESTADÍSTICAS GENERALES'
    };
    return titles[templateName] || 'REPORTE';
  }

  private generateInternshipsTemplate(data: any, styles: string, header: string): string {
    const summaryHtml = `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.total || 0}</div>
          <div class="summary-label">Total Prácticas</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porEstado?.ACTIVA || 0}</div>
          <div class="summary-label">Activas</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porEstado?.FINALIZADA || 0}</div>
          <div class="summary-label">Finalizadas</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porEstado?.EN_PROCESO || 0}</div>
          <div class="summary-label">En Proceso</div>
        </div>
      </div>
    `;

    const tableRows = data.items?.map((item: any) => `
      <tr>
        <td>${item.estudiante?.usuario?.nombre || 'N/A'} ${item.estudiante?.usuario?.apellidoPaterno || ''}</td>
        <td>${item.estudiante?.codigoUniversitario || 'N/A'}</td>
        <td>${item.empresa?.razonSocial || item.nombreEmpresaExterna || 'N/A'}</td>
        <td>${item.estado || 'N/A'}</td>
        <td>${item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString('es-PE') : 'N/A'}</td>
        <td>${item.fechaFin ? new Date(item.fechaFin).toLocaleDateString('es-PE') : 'N/A'}</td>
        <td>${item.asesorAcademico?.usuario?.nombre || 'Sin asignar'}</td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="no-data">No hay datos disponibles</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        ${header}
        <div class="main-content">
          ${summaryHtml}
          <h2 class="section-title">Relación de Prácticas Profesionales</h2>
          <table>
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Código</th>
                <th>Empresa</th>
                <th>Estado</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
                <th>Asesor Académico</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Universidad Nacional de Trujillo - Sistema de Gestión de Prácticas y Tesis
        </div>
      </body>
      </html>
    `;
  }

  private generateThesisTemplate(data: any, styles: string, header: string): string {
    const summaryHtml = `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.total || 0}</div>
          <div class="summary-label">Total Tesis</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porEstado?.EN_DESARROLLO || 0}</div>
          <div class="summary-label">En Desarrollo</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porEstado?.APROBADO || 0}</div>
          <div class="summary-label">Aprobadas</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porEstado?.SUSTENTADO || 0}</div>
          <div class="summary-label">Sustentadas</div>
        </div>
      </div>
    `;

    const tableRows = data.items?.map((item: any) => `
      <tr>
        <td>${item.titulo || 'N/A'}</td>
        <td>${item.estudiante?.usuario?.nombre || 'N/A'} ${item.estudiante?.usuario?.apellidoPaterno || ''}</td>
        <td>${item.estudiante?.codigoUniversitario || 'N/A'}</td>
        <td>${item.area || 'N/A'}</td>
        <td>${item.estado || 'N/A'}</td>
        <td>${item.asesor?.usuario?.nombre || 'Sin asignar'}</td>
        <td>${item.fechaRegistro ? new Date(item.fechaRegistro).toLocaleDateString('es-PE') : 'N/A'}</td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="no-data">No hay datos disponibles</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        ${header}
        <div class="main-content">
          ${summaryHtml}
          <h2 class="section-title">Relación de Proyectos de Tesis</h2>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Estudiante</th>
                <th>Código</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Asesor</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Universidad Nacional de Trujillo - Sistema de Gestión de Prácticas y Tesis
        </div>
      </body>
      </html>
    `;
  }

  private generateStudentsTemplate(data: any, styles: string, header: string): string {
    const summaryHtml = `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.total || 0}</div>
          <div class="summary-label">Total Estudiantes</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.items?.filter((e: any) => e.activo).length || 0}</div>
          <div class="summary-label">Activos</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.enPractica || 0}</div>
          <div class="summary-label">En Prácticas</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.enTesis || 0}</div>
          <div class="summary-label">En Tesis</div>
        </div>
      </div>
    `;

    const tableRows = data.items?.map((item: any) => `
      <tr>
        <td>${item.usuario?.nombre || 'N/A'} ${item.usuario?.apellidoPaterno || ''} ${item.usuario?.apellidoMaterno || ''}</td>
        <td>${item.codigoUniversitario || 'N/A'}</td>
        <td>${item.carrera?.nombre || 'N/A'}</td>
        <td>${item.anioIngreso || 'N/A'}</td>
        <td>${item.promedioGeneral || 'N/A'}</td>
        <td>${item.creditosAprobados || 'N/A'}</td>
        <td>${item.activo ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('') || '<tr><td colspan="7" class="no-data">No hay datos disponibles</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        ${header}
        <div class="main-content">
          ${summaryHtml}
          <h2 class="section-title">Relación de Estudiantes</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Código Universitario</th>
                <th>Carrera</th>
                <th>Año Ingreso</th>
                <th>Promedio</th>
                <th>Créditos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Universidad Nacional de Trujillo - Sistema de Gestión de Prácticas y Tesis
        </div>
      </body>
      </html>
    `;
  }

  private generateAdvisorsTemplate(data: any, styles: string, header: string): string {
    const summaryHtml = `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.total || 0}</div>
          <div class="summary-label">Total Docentes</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.conCarga || 0}</div>
          <div class="summary-label">Con Carga</div>
        </div>
      </div>
    `;

    const tableRows = data.items?.map((item: any) => `
      <tr>
        <td>${item.nombre || 'N/A'}</td>
        <td>${item.email || 'N/A'}</td>
        <td>${item.especialidad || 'N/A'}</td>
        <td>${item.categoria || 'N/A'}</td>
        <td>${item.cargaTotal || 0}</td>
        <td>${item.activo ? 'Activo' : 'Inactivo'}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="no-data">No hay datos disponibles</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        ${header}
        <div class="main-content">
          ${summaryHtml}
          <h2 class="section-title">Lista de Docentes y Asesores</h2>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Especialidad</th>
                <th>Categoría</th>
                <th>Carga</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Universidad Nacional de Trujillo - Sistema de Gestión de Prácticas y Tesis
        </div>
      </body>
      </html>
    `;
  }

  private generateAgreementsTemplate(data: any, styles: string, header: string): string {
    const summaryHtml = `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.total || 0}</div>
          <div class="summary-label">Total Convenios</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.porVencer30Dias || 0}</div>
          <div class="summary-label">Por Vencer</div>
        </div>
      </div>
    `;

    const tableRows = data.items?.map((item: any) => `
      <tr>
        <td>${item.empresa || 'N/A'}</td>
        <td>${item.tipo || 'N/A'}</td>
        <td>${item.fechaInicio ? new Date(item.fechaInicio).toLocaleDateString('es-PE') : 'N/A'}</td>
        <td>${item.fechaVencimiento ? new Date(item.fechaVencimiento).toLocaleDateString('es-PE') : 'N/A'}</td>
        <td>${item.diasRestantes || 'N/A'}</td>
        <td>${item.alerta || 'N/A'}</td>
      </tr>
    `).join('') || '<tr><td colspan="6" class="no-data">No hay datos disponibles</td></tr>';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        ${header}
        <div class="main-content">
          ${summaryHtml}
          <h2 class="section-title">Lista de Convenios</h2>
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Inicio</th>
                <th>Vencimiento</th>
                <th>Días Rest.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
        <div class="footer">
          Universidad Nacional de Trujillo - Sistema de Gestión de Prácticas y Tesis
        </div>
      </body>
      </html>
    `;
  }

  private generateStatsTemplate(data: any, styles: string, header: string): string {
    const summaryHtml = `
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.practicas?.total || 0}</div>
          <div class="summary-label">Prácticas</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.tesis?.total || 0}</div>
          <div class="summary-label">Tesis</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.estudiantes?.total || 0}</div>
          <div class="summary-label">Estudiantes</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.docentes?.total || 0}</div>
          <div class="summary-label">Docentes</div>
        </div>
      </div>
    `;

    const practicasDetails = Object.entries(data.practicas?.porEstado || {}).map(([estado, count]: [string, any]) => `
      <tr>
        <td>Prácticas</td>
        <td>${estado}</td>
        <td>${count}</td>
      </tr>
    `).join('');

    const tesisDetails = Object.entries(data.tesis?.porEstado || {}).map(([estado, count]: [string, any]) => `
      <tr>
        <td>Tesis</td>
        <td>${estado}</td>
        <td>${count}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${styles}
      </head>
      <body>
        ${header}
        <div class="main-content">
          ${summaryHtml}
          <h2 class="section-title">Detalle de Estadísticas</h2>
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Cantidad</th>
            </tr>
          </thead>
          <tbody>
            ${practicasDetails}
            ${tesisDetails}
          </tbody>
        </table>
        </div>
        <div class="footer">
          Universidad Nacional de Trujillo - Sistema de Gestión de Prácticas y Tesis
        </div>
      </body>
      </html>
    `;
  }

  // ==================== REPORTES PDF ====================

  async generateReportPDF(reportType: string, filters?: ReportFilters): Promise<Buffer> {
    const fecha = new Date().toLocaleDateString('es-PE');
    let data: any;
    let templateName: string;

    switch (reportType) {
      case 'practicas-en-curso':
        data = await this.getPracticasEnCurso(filters);
        templateName = 'practicas-en-curso';
        break;
      case 'postulaciones':
        data = await this.getPostulacionesPracticas(filters);
        templateName = 'postulaciones';
        break;
      case 'seguimiento-tesis':
        data = await this.getSeguimientoTesis(filters);
        templateName = 'seguimiento-tesis';
        break;
      case 'evaluaciones':
        data = await this.getEvaluacionesYAprobaciones(filters);
        templateName = 'evaluaciones';
        break;
      case 'sustentaciones':
        data = await this.getSustentacionesProgramadas(filters);
        templateName = 'sustentaciones';
        break;
      case 'convenios':
        data = await this.getConveniosActivos(filters);
        templateName = 'convenios';
        break;
      case 'alertas':
        data = await this.getAlertasOperativas();
        templateName = 'alertas';
        break;
      case 'indicadores-generales':
        data = await this.getIndicadoresGenerales();
        templateName = 'indicadores-generales';
        break;
      case 'rendimiento-practicas':
        data = await this.getRendimientoPracticas();
        templateName = 'rendimiento-practicas';
        break;
      case 'participacion-empresas':
        data = await this.getParticipacionEmpresas();
        templateName = 'participacion-empresas';
        break;
      case 'rendimiento-tesis':
        data = await this.getRendimientoTesis();
        templateName = 'rendimiento-tesis';
        break;
      case 'desempeno-asesores':
        data = await this.getDesempenoAsesores();
        templateName = 'desempeno-asesores';
        break;
      case 'cumplimiento-plazos':
        data = await this.getCumplimientoPlazos();
        templateName = 'cumplimiento-plazos';
        break;
      case 'evolucion-temporal':
        data = await this.getEvolucionTemporal(filters);
        templateName = 'evolucion-temporal';
        break;
      case 'estado-convenios':
        data = await this.getEstadoConvenios();
        templateName = 'estado-convenios';
        break;
      default:
        throw new Error(`Tipo de reporte no soportado: ${reportType}`);
    }

    const html = this.renderTemplate(templateName, { ...data, fecha });
    return this.generatePDF(html);
  }

  // Mantener compatibilidad hacia atrás
  async generateInternshipReportPDF(filters?: ReportFilters): Promise<Buffer> {
    return this.generateReportPDF('practicas-en-curso', filters);
  }

  async generateThesisReportPDF(filters?: ReportFilters): Promise<Buffer> {
    return this.generateReportPDF('seguimiento-tesis', filters);
  }

  // ==================== MÉTODOS DE COLECCIÓN DE DATOS (para frontend) ====================

  async collectInternshipData(filters?: ReportFilters): Promise<any> {
    const [
      indicadores,
      practicasEnCurso,
      postulaciones,
      rendimiento,
      participacionEmpresas,
    ] = await Promise.all([
      this.getIndicadoresGenerales(),
      this.getPracticasEnCurso(filters),
      this.getPostulacionesPracticas(filters),
      this.getRendimientoPracticas(),
      this.getParticipacionEmpresas(),
    ]);

    return {
      resumen: indicadores.practicas,
      empresas: indicadores.empresas,
      estudiantes: {
        total: indicadores.estudiantes.total,
        enPractica: indicadores.estudiantes.enPractica,
      },
      practicasEnCurso,
      postulaciones,
      rendimiento,
      participacionEmpresas,
    };
  }

  async collectThesisData(filters?: ReportFilters): Promise<any> {
    const [
      indicadores,
      seguimiento,
      evaluaciones,
      sustentaciones,
      rendimiento,
      desempenoAsesores,
      cumplimientoPlazos,
    ] = await Promise.all([
      this.getIndicadoresGenerales(),
      this.getSeguimientoTesis(filters),
      this.getEvaluacionesYAprobaciones(filters),
      this.getSustentacionesProgramadas(filters),
      this.getRendimientoTesis(),
      this.getDesempenoAsesores(),
      this.getCumplimientoPlazos(),
    ]);

    return {
      resumen: indicadores.tesis,
      estudiantes: {
        total: indicadores.estudiantes.total,
        enTesis: indicadores.estudiantes.enTesis,
      },
      seguimiento,
      evaluaciones,
      sustentaciones,
      rendimiento,
      desempenoAsesores,
      cumplimientoPlazos,
    };
  }

  // ==================== MÉTODOS AUXILIARES ====================

  private groupByMonth(dates: Date[]): Record<string, number> {
    const counts: Record<string, number> = {};
    dates.forEach(date => {
      const d = new Date(date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  // ==================== REPORTES DE FACULTAD (COORDINADOR) ====================

  /**
   * Obtiene las prácticas de estudiantes de una facultad específica
   * Requiere el ID de la facultad del coordinador
   */
  async getFacultyInternships(facultadId: number | undefined, filters?: ReportFilters): Promise<any> {
    // Si facultadId es undefined, mostrar todas las prácticas (acceso total)
    let carreraIds: number[] = [];
    
    if (facultadId !== undefined) {
      // Obtener carreras de la facultad específica
      const carreras = await this.userRepo.query(
        `SELECT c.id FROM carrera c WHERE c.facultad_id = $1`,
        [facultadId]
      );
      carreraIds = carreras.map((c: any) => c.id);

      if (carreraIds.length === 0) {
        return { total: 0, items: [] };
      }
    }

    // Obtener prácticas de estudiantes de esas carreras (o todas si carreraIds está vacío)
    const query = this.internshipRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.estudiante', 'e')
      .leftJoinAndSelect('e.usuario', 'u')
      .leftJoinAndSelect('e.carrera', 'c')
      .leftJoinAndSelect('p.empresa', 'emp')
      .leftJoinAndSelect('p.asesorAcademico', 'aa');
    
    // Solo filtrar por carrera si hay carreras específicas
    if (carreraIds.length > 0) {
      query.where('e.carrera_id IN (:...carreraIds)', { carreraIds });
    }
    
    const practicas = await query
      .orderBy('p.fecha_inicio', 'DESC')
      .getMany();

    return {
      total: practicas.length,
      facultadId,
      items: practicas.map(p => ({
        id: p.id,
        estudiante: `${p.estudiante?.usuario?.nombre || ''} ${p.estudiante?.usuario?.apellidoPaterno || ''}`,
        codigoUniversitario: p.estudiante?.codigoUniversitario,
        carrera: p.estudiante?.carrera?.nombre,
        empresa: p.empresa?.razonSocial || p.empresa?.nombreComercial,
        estado: p.estado,
        horasCompletadas: p.horasCompletadas || 0,
        horasTotalesRequeridas: p.horasTotalesRequeridas,
        fechaInicio: p.fechaInicio,
        fechaFin: p.fechaFin,
        asesorAcademico: p.asesorAcademico ? `${p.asesorAcademico.nombre} ${p.asesorAcademico.apellidoPaterno}` : 'Sin asignar',
      })),
    };
  }

  /**
   * Obtiene los proyectos de tesis de estudiantes de una facultad específica
   */
  async getFacultyThesis(facultadId: number | undefined, filters?: ReportFilters): Promise<any> {
    // Si facultadId es undefined, mostrar todas las tesis (acceso total)
    let carreraIds: number[] = [];
    
    if (facultadId !== undefined) {
      const carreras = await this.userRepo.query(
        `SELECT c.id FROM carrera c WHERE c.facultad_id = $1`,
        [facultadId]
      );
      carreraIds = carreras.map((c: any) => c.id);

      if (carreraIds.length === 0) {
        return { total: 0, items: [] };
      }
    }

    const query = this.thesisRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.estudiante', 'e')
      .leftJoinAndSelect('e.usuario', 'u')
      .leftJoinAndSelect('e.carrera', 'c')
      .leftJoinAndSelect('t.asignaciones', 'a')
      .leftJoinAndSelect('a.docente', 'd')
      .leftJoinAndSelect('d.usuario', 'du');
    
    // Solo filtrar por carrera si hay carreras específicas
    if (carreraIds.length > 0) {
      query.where('e.carrera_id IN (:...carreraIds)', { carreraIds });
    }
    
    const tesis = await query
      .orderBy('t.fecha_registro', 'DESC')
      .getMany();

    return {
      total: tesis.length,
      facultadId,
      items: tesis.map(t => {
        const asesor = t.asignaciones?.find(a => a.tipo === AsignacionTipo.ASESOR);
        const jurado = t.asignaciones?.filter(a => a.tipo === AsignacionTipo.JURADO) || [];
        return {
          id: t.id,
          titulo: t.titulo,
          estudiante: `${t.estudiante?.usuario?.nombre || ''} ${t.estudiante?.usuario?.apellidoPaterno || ''}`,
          codigoUniversitario: t.estudiante?.codigoUniversitario,
          carrera: t.estudiante?.carrera?.nombre,
          estado: t.estado,
          area: t.areaConocimiento,
          asesor: asesor ? `${asesor.docente?.nombre} ${asesor.docente?.apellidoPaterno}` : 'Sin asignar',
          juradoCount: jurado.length,
          fechaRegistro: t.fechaRegistro,
        };
      }),
    };
  }

  /**
   * Obtiene los estudiantes activos de una facultad (con prácticas o tesis)
   */
  async getFacultyStudents(facultadId: number | undefined, filters?: ReportFilters): Promise<any> {
    // Si facultadId es undefined, mostrar todos los estudiantes (acceso total)
    let carreraIds: number[] = [];
    
    if (facultadId !== undefined) {
      const carreras = await this.userRepo.query(
        `SELECT c.id FROM carrera c WHERE c.facultad_id = $1`,
        [facultadId]
      );
      carreraIds = carreras.map((c: any) => c.id);

      if (carreraIds.length === 0) {
        return { total: 0, items: [] };
      }
    }

    const query = this.studentRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.usuario', 'u')
      .leftJoinAndSelect('e.carrera', 'c');
    
    // Build where conditions
    const whereConditions: any = { activo: true };
    
    // Solo filtrar por carrera si hay carreras específicas
    if (carreraIds.length > 0) {
      whereConditions.carreraId = carreraIds;
    }
    
    query.where(whereConditions);
    
    const estudiantes = await query
      .orderBy('u.apellido_paterno', 'ASC')
      .getMany();

    return {
      total: estudiantes.length,
      facultadId,
      items: estudiantes.map(e => ({
        id: e.id,
        nombre: `${e.usuario?.nombre} ${e.usuario?.apellidoPaterno} ${e.usuario?.apellidoMaterno}`,
        codigoUniversitario: e.codigoUniversitario,
        carrera: e.carrera?.nombre,
        email: e.usuario?.email,
        promedio: e.promedioGeneral,
        creditos: e.creditosAprobados,
      })),
    };
  }

  /**
   * Obtiene los docentes/asesores de una facultad con su carga académica
   */
  async getFacultyAdvisors(facultadId: number | undefined, filters?: ReportFilters): Promise<any> {
    // Obtener docentes de la facultad a través de las carreras
    let query = `SELECT DISTINCT d.id, d.usuario_id, d.especialidad, d.categoria,
              u.nombre, u.apellido_paterno, u.apellido_materno, u.email,
              c.nombre as carrera_nombre
       FROM docente d
       INNER JOIN usuario u ON u.id = d.usuario_id
       INNER JOIN carrera c ON c.id = d.carrera_id`;
    
    let params: any[] = [];
    if (facultadId !== undefined) {
      query += ` WHERE c.facultad_id = $1 AND u.activo = true`;
      params.push(facultadId);
    } else {
      query += ` WHERE u.activo = true`;
    }
    
    const docentes = await this.userRepo.query(query, params);

    const items = await Promise.all(
      docentes.map(async (d: any) => {
        // Contar prácticas asignadas
        const practicasCount = await this.internshipRepo
          .createQueryBuilder('p')
          .where('p.asesor_academico_id = :docenteId', { docenteId: d.id })
          .getCount();

        // Contar tesis donde es asesor
        const tesisAsesorCount = await this.assignmentRepo
          .createQueryBuilder('a')
          .where('a.docente_id = :docenteId', { docenteId: d.id })
          .andWhere('a.tipo = :tipo', { tipo: AsignacionTipo.ASESOR })
          .getCount();

        // Contar tesis donde es jurado
        const tesisJuradoCount = await this.assignmentRepo
          .createQueryBuilder('a')
          .where('a.docente_id = :docenteId', { docenteId: d.id })
          .andWhere('a.tipo = :tipo', { tipo: AsignacionTipo.JURADO })
          .getCount();

        return {
          id: d.id,
          nombre: `${d.nombre} ${d.apellido_paterno} ${d.apellido_materno}`,
          email: d.email,
          especialidad: d.especialidad,
          categoria: d.categoria,
          carrera: d.carrera_nombre,
          cargaTotal: practicasCount + tesisAsesorCount + tesisJuradoCount,
          practicasAsesoria: practicasCount,
          tesisAsesoria: tesisAsesorCount,
          tesisJurado: tesisJuradoCount,
        };
      })
    );

    return {
      total: docentes.length,
      facultadId,
      items: items.sort((a, b) => b.cargaTotal - a.cargaTotal),
    };
  }

  /**
   * Obtiene los convenios relacionados con estudiantes de la facultad
   */
  async getFacultyAgreements(facultadId: number | undefined, filters?: ReportFilters): Promise<any> {
    // Obtener empresas que tienen convenios y también tienen prácticas con estudiantes
    // Si facultadId es undefined, mostrar todos los convenios (acceso total)
    const query = this.agreementRepo
      .createQueryBuilder('conv')
      .leftJoinAndSelect('conv.empresa', 'e')
      .innerJoin(
        'practica',
        'p',
        'p.empresa_id = conv.empresa_id'
      )
      .innerJoin(
        'estudiante',
        'est',
        'est.id = p.estudiante_id'
      )
      .innerJoin(
        'carrera',
        'c',
        'c.id = est.carrera_id'
      );
    
    // Solo filtrar por facultad si hay una facultad específica
    if (facultadId !== undefined) {
      query.andWhere('c.facultad_id = :facultadId', { facultadId });
    }
    
    const convenios = await query
      .distinct(true)
      .getMany();

    return {
      total: convenios.length,
      facultadId,
      items: convenios.map(c => ({
        id: c.id,
        empresa: c.empresa?.razonSocial,
        ruc: c.empresa?.ruc,
        tipo: c.tipo,
        estado: c.estado,
        fechaInicio: c.fechaInicio,
        fechaVencimiento: c.fechaVencimiento,
        diasRestantes: Math.ceil((new Date(c.fechaVencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      })),
    };
  }

  /**
   * Estadísticas generales de la facultad
   */
  async getFacultyStats(facultadId: number | undefined, filters?: ReportFilters): Promise<any> {
    try {
      // Simplified approach - get basic counts without complex relations
      let carreraIds: number[] = [];
      
      if (facultadId !== undefined) {
        const carreras = await this.userRepo.query(
          `SELECT c.id FROM carrera c WHERE c.facultad_id = $1`,
          [facultadId]
        );
        carreraIds = carreras.map((c: any) => c.id);
      }

      // Get practice stats
      let practicasQuery = this.internshipRepo
        .createQueryBuilder('p')
        .leftJoin('p.estudiante', 'e');
      
      if (carreraIds.length > 0) {
        practicasQuery = practicasQuery.where('e.carrera_id IN (:...carreraIds)', { carreraIds });
      }
      
      const practicas = await practicasQuery.getMany();
      
      // Get thesis stats
      let tesisQuery = this.thesisRepo
        .createQueryBuilder('t')
        .leftJoin('t.estudiante', 'e')
        .where('t.activo = :activo', { activo: true });
      
      if (carreraIds.length > 0) {
        tesisQuery = tesisQuery.andWhere('e.carrera_id IN (:...carreraIds)', { carreraIds });
      }
      
      const tesis = await tesisQuery.getMany();
      
      // Get student stats
      let estudiantesQuery = this.studentRepo
        .createQueryBuilder('e')
        .where('e.activo = :activo', { activo: true });
      
      if (carreraIds.length > 0) {
        estudiantesQuery = estudiantesQuery.andWhere('e.carrera_id IN (:...carreraIds)', { carreraIds });
      }
      
      const estudiantes = await estudiantesQuery.getMany();

      // Group by states
      const practicasPorEstado = this.groupByEstado(practicas, 'estado');
      const tesisPorEstado = this.groupByEstado(tesis, 'estado');

      return {
        facultadId,
        fecha: new Date().toLocaleDateString('es-PE'),
        practicas: {
          total: practicas.length,
          porEstado: practicasPorEstado,
        },
        tesis: {
          total: tesis.length,
          porEstado: tesisPorEstado,
        },
        estudiantes: {
          total: estudiantes.length,
          enPractica: practicasPorEstado.ACTIVA || 0,
          enTesis: tesisPorEstado.EN_DESARROLLO || 0,
        },
        docentes: {
          total: 0, // Simplified for now
          conCarga: 0,
        },
      };
    } catch (error) {
      console.error('Error in getFacultyStats:', error);
      // Return safe default values
      return {
        facultadId,
        fecha: new Date().toLocaleDateString('es-PE'),
        practicas: { total: 0, porEstado: {} },
        tesis: { total: 0, porEstado: {} },
        estudiantes: { total: 0, enPractica: 0, enTesis: 0 },
        docentes: { total: 0, conCarga: 0 },
      };
    }
  }

  private groupByEstado(items: any[], key: string): Record<string, number> {
    const counts: Record<string, number> = {};
    items.forEach(item => {
      const estado = item[key] || 'desconocido';
      counts[estado] = (counts[estado] || 0) + 1;
    });
    return counts;
  }
}