import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, IsNull, Not } from 'typeorm';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import { Internship, InternshipEstado } from '../internships/entities/internship.entity';
import { InternshipApplication, ApplicationEstado } from '../internships/entities/internship-application.entity';
import { InternshipOffer, OfertaEstado } from '../internships/entities/internship-offer.entity';
import { ThesisProject, ThesisEstado } from '../thesis/entities/thesis-project.entity';
import { ThesisAssignment, AsignacionTipo } from '../thesis/entities/thesis-assignment.entity';
import { Deliverable } from '../thesis/entities/deliverable.entity';
import { DeliverableSubmission, EntregaEstado } from '../thesis/entities/deliverable-submission.entity';
import { DefenseRecord } from '../thesis/entities/defense-record.entity';
import { Agreement, EstadoConvenio } from '../agreements/entities/agreement.entity';
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
  ) {}

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

    const totalHoras = await this.internshipRepo
      .createQueryBuilder('p')
      .select('SUM(p.horasCompletadas)', 'total')
      .where('p.estado = :estado', { estado: InternshipEstado.ACTIVA })
      .getRawOne();

    return {
      total: practicas.length,
      horasAcumuladasTotal: parseInt(totalHoras?.total || 0),
      promedioHorasCompletadas: practicas.length > 0
        ? practicas.reduce((sum, p) => sum + (p.horasCompletadas || 0), 0) / practicas.length
        : 0,
      items: practicas.map(p => ({
        id: p.id,
        estudiante: `${p.estudiante?.usuario?.nombre || ''} ${p.estudiante?.usuario?.apellidoPaterno || ''}`,
        codigoUniversitario: p.estudiante?.codigoUniversitario,
        empresa: p.empresa?.razonSocial || p.empresa?.nombreComercial,
        horasCompletadas: p.horasCompletadas || 0,
        horasTotalesRequeridas: p.horasTotalesRequeridas,
        progreso: ((p.horasCompletadas || 0) / p.horasTotalesRequeridas * 100).toFixed(1),
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
        tituloEntrega: e.tituloEntrega,
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
    const where: any = { estado: EstadoConvenio.VIGENTE };
    if (filters?.empresaId) where.empresaId = filters.empresaId;

    const convenios = await this.agreementRepo.find({
      where,
      relations: ['empresa'],
      order: { fechaVencimiento: 'ASC' },
    });

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
          objetoContrato: c.objetoContrato?.substring(0, 100) + '...',
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

    // Convenios por vencer
    const conveniosPorVencer = await this.agreementRepo.find({
      where: {
        estado: EstadoConvenio.VIGENTE,
        fechaVencimiento: LessThan(treintaDias),
      },
      relations: ['empresa'],
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
    const conveniosVigentes = convenios.filter(c => c.estado === EstadoConvenio.VIGENTE);

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
    const asesores = await this.userRepo.find({ where: { rol: RolUsuario.ASESOR } });
    const assignments = await this.assignmentRepo.find({
      relations: ['docente', 'proyecto', 'proyecto.estudiante', 'proyecto.estudiante.usuario'],
    });

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
    const porVencer = convenios.filter(c => {
      const diasRestantes = Math.ceil((new Date(c.fechaVencimiento).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24));
      return c.estado === EstadoConvenio.VIGENTE && diasRestantes <= 60;
    });

    return {
      total: convenios.length,
      porEstado: {
        vigente: convenios.filter(c => c.estado === EstadoConvenio.VIGENTE).length,
        vencido: convenios.filter(c => c.estado === EstadoConvenio.VENCIDO).length,
        renovado: convenios.filter(c => c.estado === EstadoConvenio.RENOVADO).length,
      },
      porTipo: {
        marco: convenios.filter(c => c.tipo === 'marco').length,
        especifico: convenios.filter(c => c.tipo === 'especifico').length,
      },
      porVencer60Dias: porVencer.length,
      conveniosPorEmpresa: convenios.map(c => ({
        id: c.id,
        empresa: c.empresa?.razonSocial || c.empresa?.nombreComercial,
        estado: c.estado,
        tipo: c.tipo,
        fechaInicio: c.fechaInicio,
        fechaVencimiento: c.fechaVencimiento,
        diasRestantes: Math.ceil((new Date(c.fechaVencimiento).getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)),
      })),
    };
  }

  private renderTemplate(templateName: string, data: any): string {
    const commonStyles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #1f2937; line-height: 1.6; }
        h1 { color: #1e40af; font-size: 24px; margin-bottom: 10px; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
        h2 { color: #374151; font-size: 18px; margin: 20px 0 10px 0; }
        h3 { color: #4b5563; font-size: 14px; margin: 15px 0 8px 0; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .fecha { color: #6b7280; font-size: 12px; }
        .summary { background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin: 20px 0; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; }
        .summary-item { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .summary-value { font-size: 28px; font-weight: bold; color: #1e40af; }
        .summary-label { font-size: 11px; color: #6b7280; text-transform: uppercase; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
        th { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 12px 8px; text-align: left; font-weight: 600; }
        td { padding: 10px 8px; border-bottom: 1px solid #e5e7eb; }
        tr:nth-child(even) { background: #f9fafb; }
        tr:hover { background: #f3f4f6; }
        .badge { padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
        .badge-activa, .badge-aprobado, .badge-entregado { background: #dcfce7; color: #166534; }
        .badge-finalizada, .badge-culminado { background: #dbeafe; color: #1e40af; }
        .badge-pendiente, .badge-postulado { background: #fef3c7; color: #92400e; }
        .badge-observado, .badge-vencido { background: #fee2e2; color: #991b1b; }
        .badge-en_desarrollo, .badge-revisando { background: #e0e7ff; color: #3730a3; }
        .alert { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; }
        .alert-warning { background: #fef3c7; color: #92400e; }
        .alert-danger { background: #fee2e2; color: #991b1b; }
        .alert-success { background: #dcfce7; color: #166534; }
        .section { margin: 25px 0; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
        .card-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .card-label { font-size: 11px; color: #6b7280; margin-top: 5px; }
        .progress-bar { background: #e5e7eb; border-radius: 10px; height: 8px; overflow: hidden; }
        .progress-fill { background: linear-gradient(90deg, #3b82f6, #1e40af); height: 100%; border-radius: 10px; }
        .text-muted { color: #6b7280; }
        .text-small { font-size: 10px; }
        .empty-state { text-align: center; padding: 40px; color: #9ca3af; }
      </style>
    `;

    const templates: Record<string, string> = {
      'practicas-en-curso': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Prácticas en Curso</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
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
          </body>
        </html>
      `,

      'postulaciones': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Postulaciones</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
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
          </body>
        </html>
      `,

      'seguimiento-tesis': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Seguimiento de Tesis</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Proyectos</div></div>
                <div class="summary-item"><div class="summary-value">{{conAtrasos}}</div><div class="summary-label">Con Atrasos</div></div>
                <div class="summary-item"><div class="summary-value">{{sinAsesor}}</div><div class="summary-label">Sin Asesor</div></div>
              </div>
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
          </body>
        </html>
      `,

      'evaluaciones': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Evaluaciones y Aprobaciones</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{totalEvaluado}}</div><div class="summary-label">Total Evaluado</div></div>
                <div class="summary-item"><div class="summary-value">{{pendientesRevision}}</div><div class="summary-label">Pendientes</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaAprobacion}}%</div><div class="summary-label">Tasa Aprobación</div></div>
              </div>
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
          </body>
        </html>
      `,

      'sustentaciones': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Sustentaciones Programadas</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Sustentaciones</div></div>
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
          </body>
        </html>
      `,

      'convenios': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Convenios Activos</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Convenios</div></div>
                <div class="summary-item"><div class="summary-value">{{porVencer30Dias}}</div><div class="summary-label">Vencen <30 días</div></div>
                <div class="summary-item"><div class="summary-value">{{porVencer60Dias}}</div><div class="summary-label">Vencen <60 días</div></div>
              </div>
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
          </body>
        </html>
      `,

      'alertas': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Alertas Operativas</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
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
          </body>
        </html>
      `,

      'indicadores-generales': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Indicadores Generales</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
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
          </body>
        </html>
      `,

      'rendimiento-practicas': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Rendimiento de Prácticas</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{tasaColocacion}}%</div><div class="summary-label">Tasa Colocación</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioDiasColocacion}}</div><div class="summary-label">Días Promedio</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaAprobacion}}%</div><div class="summary-label">Tasa Aprobación</div></div>
                <div class="summary-item"><div class="summary-value">{{totalPostulaciones}}</div><div class="summary-label">Total Postulaciones</div></div>
              </div>
            </div>
            <h2>Distribución por Estado</h2>
            <div class="grid-4">
              <div class="card"><div class="card-value">{{porEstado.postulado}}</div><div class="card-label">Postulado</div></div>
              <div class="card"><div class="card-value">{{porEstado.preseleccionado}}</div><div class="card-label">Preseleccionado</div></div>
              <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
              <div class="card"><div class="card-value">{{porEstado.rechazado}}</div><div class="card-label">Rechazado</div></div>
            </div>
          </body>
        </html>
      `,

      'participacion-empresas': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Participación de Empresas</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{totalEmpresas}}</div><div class="summary-label">Total Empresas</div></div>
                <div class="summary-item"><div class="summary-value">{{empresasActivas}}</div><div class="summary-label">Empresas Activas</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioPracticantesPorEmpresa}}</div><div class="summary-label">Promedio Practicantes</div></div>
                <div class="summary-item"><div class="summary-value">{{empresasSinActividad}}</div><div class="summary-label">Sin Actividad</div></div>
              </div>
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
          </body>
        </html>
      `,

      'rendimiento-tesis': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Rendimiento de Tesis</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{totalTesis}}</div><div class="summary-label">Total Tesis</div></div>
                <div class="summary-item"><div class="summary-value">{{sustentadas}}</div><div class="summary-label">Sustentadas</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaAprobacion}}%</div><div class="summary-label">Tasa Aprobación</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioDiasDesarrollo}}</div><div class="summary-label">Días Promedio</div></div>
              </div>
            </div>
            <h2>Distribución por Estado</h2>
            <div class="grid-4">
              <div class="card"><div class="card-value">{{porEstado.en_registro}}</div><div class="card-label">En Registro</div></div>
              <div class="card"><div class="card-value">{{porEstado.propuesto}}</div><div class="card-label">Propuesto</div></div>
              <div class="card"><div class="card-value">{{porEstado.aprobado}}</div><div class="card-label">Aprobado</div></div>
              <div class="card"><div class="card-value">{{porEstado.en_desarrollo}}</div><div class="card-label">En Desarrollo</div></div>
            </div>
          </body>
        </html>
      `,

      'desempeno-asesores': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Desempeño de Asesores</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{totalAsesores}}</div><div class="summary-label">Total Asesores</div></div>
                <div class="summary-item"><div class="summary-value">{{asesoresActivos}}</div><div class="summary-label">Asesores Activos</div></div>
                <div class="summary-item"><div class="summary-value">{{promedioTesisPorAsesor}}</div><div class="summary-label">Promedio Tesis/Asesor</div></div>
              </div>
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
          </body>
        </html>
      `,

      'cumplimiento-plazos': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Cumplimiento de Plazos</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{totalEntregas}}</div><div class="summary-label">Total Entregas</div></div>
                <div class="summary-item"><div class="summary-value">{{aTiempo}}</div><div class="summary-label">A Tiempo</div></div>
                <div class="summary-item"><div class="summary-value">{{retrasadas}}</div><div class="summary-label">Retrasadas</div></div>
                <div class="summary-item"><div class="summary-value">{{tasaCumplimiento}}%</div><div class="summary-label">Tasa Cumplimiento</div></div>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <h3>Días Promedio de Retraso: {{promedioDiasRetraso}}</h3>
              <div class="progress-bar" style="margin-top: 10px; height: 20px;">
                <div class="progress-fill" style="width: {{tasaCumplimiento}}%;"></div>
              </div>
            </div>
          </body>
        </html>
      `,

      'evolucion-temporal': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Evolución Temporal</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <p class="text-muted">Período: {{periodo.desde}} - {{periodo.hasta}}</p>
              <div class="summary-grid" style="margin-top: 15px;">
                <div class="summary-item"><div class="summary-value">{{totales.practicas}}</div><div class="summary-label">Prácticas</div></div>
                <div class="summary-item"><div class="summary-value">{{totales.tesis}}</div><div class="summary-label">Tesis</div></div>
                <div class="summary-item"><div class="summary-value">{{totales.ofertas}}</div><div class="summary-label">Ofertas</div></div>
                <div class="summary-item"><div class="summary-value">{{totales.postulaciones}}</div><div class="summary-label">Postulaciones</div></div>
              </div>
            </div>
          </body>
        </html>
      `,

      'estado-convenios': `
        <html>
          <head><meta charset="UTF-8">${commonStyles}</head>
          <body>
            <div class="header">
              <h1>Reporte de Estado de Convenios</h1>
              <span class="fecha">${data.fecha}</span>
            </div>
            <div class="summary">
              <div class="summary-grid">
                <div class="summary-item"><div class="summary-value">{{total}}</div><div class="summary-label">Total Convenios</div></div>
                <div class="summary-item"><div class="summary-value">{{porEstado.vigente}}</div><div class="summary-label">Vigentes</div></div>
                <div class="summary-item"><div class="summary-value">{{porEstado.vencido}}</div><div class="summary-label">Vencidos</div></div>
                <div class="summary-item"><div class="summary-value">{{porVencer60Dias}}</div><div class="summary-label">Por Vencer <60d</div></div>
              </div>
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
}