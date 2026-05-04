import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not, In } from 'typeorm';
import { InternshipOffer, OfertaEstado } from './entities/internship-offer.entity';
import { InternshipApplication, ApplicationEstado } from './entities/internship-application.entity';
import { Internship, InternshipEstado, PracticaOrigen } from './entities/internship.entity';
import { HoursTracking } from './entities/hours-tracking.entity';
import { InternshipReport, ReporteTipo, ReporteEstado } from './entities/internship-report.entity';
import { FinalEvaluation } from './entities/final-evaluation.entity';
import { CompaniesService } from '../companies/companies.service';
import { CompanyRepresentativeService } from '../companies/services/company-representative.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import { AgreementsService } from '../agreements/agreements.service';
import { NotificationsService, NotificacionPrioridad } from '../notifications/notifications.service';
import { CreateInternshipOfferDto, UpdateInternshipOfferDto } from './dto/internship-offer.dto';
import { CreateApplicationDto, ReviewApplicationDto } from './dto/application.dto';
import { CreateHoursTrackingDto } from './dto/hours-tracking.dto';
import { CreateInternshipReportDto } from './dto/internship-report.dto';
import { RoleName } from '../users/entities/role.entity';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(InternshipOffer) private offerRepo: Repository<InternshipOffer>,
    @InjectRepository(InternshipApplication) private appRepo: Repository<InternshipApplication>,
    @InjectRepository(Internship) private internshipRepo: Repository<Internship>,
    @InjectRepository(HoursTracking) private hoursRepo: Repository<HoursTracking>,
    @InjectRepository(InternshipReport) private reportRepo: Repository<InternshipReport>,
    @InjectRepository(FinalEvaluation) private evalRepo: Repository<FinalEvaluation>,
    private companiesService: CompaniesService,
    private companyRepresentativeService: CompanyRepresentativeService,
    private studentsService: StudentsService,
    private usersService: UsersService,
    private agreementsService: AgreementsService,
    private notificationsService: NotificationsService,
  ) {}

  // Ofertas
  private validateOfferDates(dto: Partial<CreateInternshipOfferDto>) {
    const fechaInicioPost = dto.fechaInicioPostulacion ? new Date(dto.fechaInicioPostulacion) : null;
    const fechaFinPost = dto.fechaFinPostulacion ? new Date(dto.fechaFinPostulacion) : null;
    const fechaInicioPract = dto.fechaInicioPractica ? new Date(dto.fechaInicioPractica) : null;
    const fechaFinPract = dto.fechaFinPractica ? new Date(dto.fechaFinPractica) : null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Validar que fechas de inicio no estén en el pasado
    if (fechaInicioPost && fechaInicioPost < hoy) {
      throw new BadRequestException('La fecha de inicio de postulación no puede estar en el pasado');
    }
    if (fechaInicioPract && fechaInicioPract < hoy) {
      throw new BadRequestException('La fecha de inicio de práctica no puede estar en el pasado');
    }

    if (fechaInicioPost && fechaFinPost && fechaInicioPost > fechaFinPost) {
      throw new BadRequestException('La fecha de fin de postulación debe ser posterior a la fecha de inicio de postulación');
    }
    if (fechaInicioPract && fechaFinPract && fechaInicioPract > fechaFinPract) {
      throw new BadRequestException('La fecha de fin de práctica debe ser posterior a la fecha de inicio de práctica');
    }
    if (fechaFinPost && fechaInicioPract && fechaInicioPract < fechaFinPost) {
      throw new BadRequestException('La fecha de inicio de práctica debe ser posterior a la fecha de fin de postulación');
    }

    // Validar duración máxima de postulación (30 días)
    if (fechaInicioPost && fechaFinPost) {
      const diasPostulacion = Math.ceil((fechaFinPost.getTime() - fechaInicioPost.getTime()) / (1000 * 60 * 60 * 24));
      if (diasPostulacion > 30) {
        throw new BadRequestException('El período de postulación no puede exceder 30 días');
      }
    }

    // Validar duración máxima de práctica (6 meses = 180 días)
    if (fechaInicioPract && fechaFinPract) {
      const diasPractica = Math.ceil((fechaFinPract.getTime() - fechaInicioPract.getTime()) / (1000 * 60 * 60 * 24));
      if (diasPractica > 180) {
        throw new BadRequestException('La práctica no puede exceder 6 meses (180 días)');
      }
      if (diasPractica < 30) {
        throw new BadRequestException('La práctica debe durar al menos 30 días');
      }
    }
  }

  async createOffer(dto: CreateInternshipOfferDto): Promise<InternshipOffer> {
    this.validateOfferDates(dto);
    await this.companiesService.findById(dto.empresaId);
    if (dto.convenioId) {
      // verificar que el convenio pertenezca a la empresa
      const conv = await this.agreementsService.findById(dto.convenioId);
      if (conv.empresaId !== dto.empresaId) throw new BadRequestException('El convenio no pertenece a la empresa');
    }
    const offer = this.offerRepo.create(dto);
    return this.offerRepo.save(offer);
  }

  async updateOffer(id: number, dto: UpdateInternshipOfferDto): Promise<InternshipOffer> {
    // Merge existing dates with incoming partial update for coherence check
    const existing = await this.findOfferById(id);
    const merged = {
      fechaInicioPostulacion: dto.fechaInicioPostulacion ?? existing.fechaInicioPostulacion as any,
      fechaFinPostulacion: dto.fechaFinPostulacion ?? existing.fechaFinPostulacion as any,
      fechaInicioPractica: dto.fechaInicioPractica ?? existing.fechaInicioPractica as any,
      fechaFinPractica: dto.fechaFinPractica ?? existing.fechaFinPractica as any,
    };
    this.validateOfferDates(merged);
    await this.offerRepo.update(id, dto);
    return this.findOfferById(id);
  }

  async deleteOffer(id: number, jwtUser?: { roles?: string[]; rol?: string }): Promise<{ success: boolean; message: string }> {
    const offer = await this.findOfferById(id);

    const isCoordinator =
      jwtUser?.roles?.includes(RoleName.COORDINADOR) || jwtUser?.rol === RoleName.COORDINADOR;
    if (isCoordinator && offer.estado !== OfertaEstado.BORRADOR) {
      throw new BadRequestException(
        'Como coordinador solo puede rechazar ofertas pendientes de aprobación (borrador).',
      );
    }

    // Verificar si hay aplicaciones aprobadas para esta oferta específica
    const activeApplications = await this.appRepo.find({
      where: {
        ofertaId: id,
        estado: ApplicationEstado.APROBADO,
      },
    });

    if (activeApplications.length > 0) {
      throw new BadRequestException(
        `No se puede cancelar esta oferta: hay ${activeApplications.length} estudiante(s) con aplicación(es) aprobada(s)`,
      );
    }

    // Soft delete: cambiar estado a CANCELADA
    offer.estado = OfertaEstado.CANCELADA;
    await this.offerRepo.save(offer);
    
    return { success: true, message: 'Oferta cancelada exitosamente' };
  }

  async publishOffer(id: number): Promise<InternshipOffer> {
    const offer = await this.findOfferById(id);
    if (offer.estado !== OfertaEstado.BORRADOR) throw new BadRequestException('Solo se pueden publicar ofertas en borrador');
    offer.estado = OfertaEstado.PUBLICADA;
    return this.offerRepo.save(offer);
  }

  async findOfferById(id: number): Promise<InternshipOffer> {
    const offer = await this.offerRepo.findOne({ where: { id }, relations: ['empresa'] });
    if (!offer) throw new NotFoundException('Oferta no encontrada');
    
    // Calcular estado 'cerrada' dinámicamente si la oferta publicada venció
    const now = new Date();
    if (offer.estado === OfertaEstado.PUBLICADA && now > new Date(offer.fechaFinPostulacion)) {
      return { ...offer, estado: OfertaEstado.CERRADA as OfertaEstado };
    }
    return offer;
  }

  async findAllOffers(
    filters?: { empresaId?: number; estado?: OfertaEstado },
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: InternshipOffer[]; total: number; page: number; limit: number; totalPages: number }> {
    const where: any = {};
    if (filters?.empresaId) where.empresaId = filters.empresaId;
    if (filters?.estado) {
      where.estado = filters.estado;
    }

    const [offers, total] = await this.offerRepo.findAndCount({
      where,
      relations: ['empresa'],
      skip: (page - 1) * limit,
      take: limit,
      order: { creadoEn: 'DESC' },
    });

    // Calcular estado 'cerrada' dinámicamente para ofertas publicadas cuya vigencia terminó
    const now = new Date();
    const data = offers.map(offer => {
      if (offer.estado === OfertaEstado.PUBLICADA && now > new Date(offer.fechaFinPostulacion)) {
        return { ...offer, estado: OfertaEstado.CERRADA as OfertaEstado };
      }
      return offer;
    });

    const totalPages = Math.ceil(total / limit);
    return { data, total, page, limit, totalPages };
  }

  // Postulaciones
  async apply(dto: CreateApplicationDto): Promise<InternshipApplication> {
    if (!dto.estudianteId) {
      throw new BadRequestException('estudianteId es requerido');
    }
    
    const offer = await this.findOfferById(dto.ofertaId);
    if (offer.estado !== OfertaEstado.PUBLICADA) throw new BadRequestException('La oferta no está disponible');
    const now = new Date();
    if (now < offer.fechaInicioPostulacion || now > offer.fechaFinPostulacion) {
      throw new BadRequestException('Fuera del período de postulación');
    }
    const existing = await this.appRepo.findOneBy({ ofertaId: dto.ofertaId, estudianteId: dto.estudianteId });
    if (existing) {
      const fechaPostulacion = existing.fechaPostulacion
        ? new Date(existing.fechaPostulacion).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'fecha desconocida';
      throw new BadRequestException(`Ya postulaste a esta oferta el ${fechaPostulacion}. No puedes postular nuevamente.`);
    }
    await this.studentsService.findById(dto.estudianteId);

    // Validar que el estudiante no tenga práctica activa, pendiente o en evaluación
    const existingInternship = await this.internshipRepo.findOne({
      where: {
        estudianteId: dto.estudianteId,
        estado: In([InternshipEstado.ACTIVA, InternshipEstado.PENDIENTE_ASIGNACION, InternshipEstado.EN_EVALUACION]),
      },
    });
    if (existingInternship) {
      throw new BadRequestException('No puedes postular porque ya tienes una práctica activa, pendiente o en evaluación');
    }

    // Handle CV file upload
    let cvUrl = dto.documentoCvUrl;
    if (dto.cvFile) {
      // If file was uploaded, create URL path to the uploaded file
      // Note: static files are served at /uploads, but files are stored in upload/
      cvUrl = `/uploads/cv/${dto.cvFile.filename}`;
    }

    const application = this.appRepo.create({
      ...dto,
      documentoCvUrl: cvUrl,
    });
    
    // Remove cvFile from the entity as it's not a database field
    delete (application as any).cvFile;
    
    const saved = await this.appRepo.save(application);

    // Notificar al representante de la empresa sobre la nueva postulación
    try {
      // Obtener representantes de la empresa
      const representantes = await this.companyRepresentativeService.findByCompany(offer.empresaId);
      const student = await this.studentsService.findById(dto.estudianteId);
      const studentName = student?.usuario?.nombre + ' ' + (student?.usuario?.apellidoPaterno || '');

      for (const rep of representantes) {
        if (rep.usuarioId) {
          await this.notificationsService.notifyUser(
            rep.usuarioId,
            'Nueva postulación recibida',
            `${studentName} se ha postulado a la oferta "${offer.titulo}"`,
            'new_application_to_offer',
            NotificacionPrioridad.MEDIA,
            { applicationId: saved.id, offerId: offer.id, studentId: dto.estudianteId },
          );
        }
      }
    } catch (error) {
      // No fallar la postulación si la notificación falla
      console.error('Error enviando notificación:', error);
    }

    return saved;
  }

  async getPendingApplications(facultadId?: number): Promise<InternshipApplication[]> {
    // Construir query base
    const query = this.appRepo
      .createQueryBuilder('app')
      .leftJoinAndSelect('app.oferta', 'oferta')
      .leftJoinAndSelect('oferta.empresa', 'empresa')
      .leftJoinAndSelect('app.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .leftJoinAndSelect('estudiante.carrera', 'carrera')
      .where('app.estado = :estado', { estado: ApplicationEstado.POSTULADO });

    // Si se especifica facultad, filtrar por ella
    if (facultadId) {
      query.andWhere('carrera.facultad_id = :facultadId', { facultadId });
    }

    return query.orderBy('app.fecha_postulacion', 'ASC').getMany();
  }

  async reviewApplication(id: number, reviewDto: ReviewApplicationDto, revisorId: number): Promise<InternshipApplication> {
    const app = await this.appRepo.findOne({ where: { id }, relations: ['oferta'] });
    if (!app) throw new NotFoundException('Postulación no encontrada');
    if (app.estado !== ApplicationEstado.POSTULADO && app.estado !== ApplicationEstado.PRESELECCIONADO) {
      throw new BadRequestException('La postulación ya fue revisada');
    }

    // Validar cupos al aprobar
    if (reviewDto.estado === ApplicationEstado.APROBADO) {
      const approvedCount = await this.appRepo.count({
        where: { ofertaId: app.ofertaId, estado: ApplicationEstado.APROBADO },
      });
      if (approvedCount >= app.oferta.cupos) {
        throw new BadRequestException(
          `No se puede aprobar: la oferta ya alcanzó el límite de ${app.oferta.cupos} cupo(s) aprobado(s)`,
        );
      }
    }

    app.estado = reviewDto.estado;
    app.fechaRevision = new Date();
    app.revisadoPor = revisorId;
    const updated = await this.appRepo.save(app);

    // Notificar al estudiante sobre la revisión de su postulación
    try {
      const student = await this.studentsService.findById(app.estudianteId);
      const offer = app.oferta;
      if (student?.usuarioId) {
        const isApproved = reviewDto.estado === ApplicationEstado.APROBADO;
        await this.notificationsService.notifyUser(
          student.usuarioId,
          isApproved ? '¡Postulación aprobada!' : 'Postulación rechazada',
          isApproved
            ? `Tu postulación a "${offer.titulo}" ha sido aprobada. Pronto se te asignará un asesor académico.`
            : `Tu postulación a "${offer.titulo}" ha sido rechazada.`,
          isApproved ? 'application_approved' : 'application_rejected',
          isApproved ? NotificacionPrioridad.ALTA : NotificacionPrioridad.MEDIA,
          { applicationId: app.id, offerId: offer.id },
        );
      }
    } catch (error) {
      console.error('Error enviando notificación al estudiante:', error);
    }

    // Si es aprobada, crear automáticamente la práctica
    if (reviewDto.estado === ApplicationEstado.APROBADO) {
      const existingInternship = await this.internshipRepo.findOneBy({ postulacionId: app.id });
      if (!existingInternship) {
        const offer = app.oferta;
        
        // ✅ Validar que la empresa esté activa antes de crear la práctica
        const empresa = await this.companiesService.findById(offer.empresaId);
        if (!empresa.activo) {
          throw new BadRequestException('No se puede aprobar la postulación porque la empresa no está activa');
        }
        
        const internship = this.internshipRepo.create({
          postulacionId: app.id,
          estudianteId: app.estudianteId,
          empresaId: offer.empresaId,
          asesorEmpresaNombre: 'Por asignar',  // ✅ Valor descriptivo en lugar de vacío
          origen: PracticaOrigen.INSTITUCIONAL,
          horasTotalesRequeridas: offer.horasTotalesRequeridas || 400,
          horasCompletadas: 0,
          fechaInicio: offer.fechaInicioPractica,
          fechaFin: offer.fechaFinPractica,
          estado: InternshipEstado.PENDIENTE_ASIGNACION,
        });
        await this.internshipRepo.save(internship);
      }
    }
    return updated;
  }

  async getPendingInternships(facultadId?: number): Promise<Internship[]> {
    // Construir query base
    const query = this.internshipRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.postulacion', 'postulacion')
      .leftJoinAndSelect('postulacion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .leftJoinAndSelect('estudiante.carrera', 'carrera')
      .leftJoinAndSelect('postulacion.oferta', 'oferta')
      .leftJoinAndSelect('oferta.empresa', 'empresa')
      .where('i.estado = :estado', { estado: InternshipEstado.PENDIENTE_ASIGNACION });

    // Si se especifica facultad, filtrar por ella
    if (facultadId) {
      query.andWhere('carrera.facultad_id = :facultadId', { facultadId });
    }

    const internships = await query.orderBy('i.fecha_inicio', 'ASC').getMany();

    // Mapear relaciones virtuales para compatibilidad
    return internships.map(internship => {
      if (internship.postulacion?.oferta?.empresa) {
        (internship as any).empresa = internship.postulacion.oferta.empresa;
      }
      if (internship.postulacion?.estudiante) {
        (internship as any).estudiante = internship.postulacion.estudiante;
      }
      return internship;
    });
  }

  async findAllInternshipsWithAdvisor(facultadId?: number): Promise<Internship[]> {
    // Construir query base
    const query = this.internshipRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.postulacion', 'postulacion')
      .leftJoinAndSelect('postulacion.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .leftJoinAndSelect('estudiante.carrera', 'carrera')
      .leftJoinAndSelect('postulacion.oferta', 'oferta')
      .leftJoinAndSelect('oferta.empresa', 'empresa')
      .leftJoinAndSelect('i.asesorAcademico', 'asesorAcademico');

    // Si se especifica facultad, filtrar por ella
    if (facultadId) {
      query.andWhere('carrera.facultad_id = :facultadId', { facultadId });
    }

    const internships = await query.orderBy('i.fecha_inicio', 'DESC').getMany();

    // Mapear relaciones virtuales para compatibilidad
    return internships.map(internship => {
      if (internship.postulacion?.oferta?.empresa) {
        (internship as any).empresa = internship.postulacion.oferta.empresa;
      }
      if (internship.postulacion?.estudiante) {
        (internship as any).estudiante = internship.postulacion.estudiante;
      }
      return internship;
    });
  }

  // Prácticas
  async assignAdvisor(internshipId: number, asesorId: number): Promise<Internship> {
    const internship = await this.findInternshipById(internshipId);
    if (internship.estado !== InternshipEstado.PENDIENTE_ASIGNACION) {
      throw new BadRequestException('La práctica no está en estado pendiente de asignación');
    }
    await this.usersService.findById(asesorId);
    internship.asesorAcademicoId = asesorId;
    internship.estado = InternshipEstado.ACTIVA;
    return this.internshipRepo.save(internship);
  }

  async findInternshipById(id: number): Promise<Internship> {
    const internship = await this.internshipRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.postulacion', 'p')
      .leftJoinAndSelect('p.estudiante', 'est')
      .leftJoinAndSelect('est.usuario', 'u')
      .leftJoinAndSelect('p.oferta', 'of')
      .leftJoinAndSelect('of.empresa', 'emp')
      .leftJoinAndSelect('i.asesorAcademico', 'aa')
      .where('i.id = :id', { id })
      .getOne();
    if (!internship) throw new NotFoundException('Práctica no encontrada');
    // Mapear relaciones virtuales para compatibilidad
    if (internship.postulacion?.oferta?.empresa) {
      (internship as any).empresa = internship.postulacion.oferta.empresa;
    }
    if (internship.postulacion?.estudiante) {
      (internship as any).estudiante = internship.postulacion.estudiante;
    }
    return internship;
  }

  // Seguimiento de horas
  async addHoursTracking(dto: CreateHoursTrackingDto): Promise<HoursTracking> {
    const internship = await this.findInternshipById(dto.practicaId);
    if (internship.estado !== InternshipEstado.ACTIVA) throw new BadRequestException('La práctica no está activa');

    // Validar que las horas estén en rango válido (1-12 horas por día)
    if (dto.horas <= 0 || dto.horas > 12) {
      throw new BadRequestException('Las horas deben estar entre 1 y 12 por día');
    }

    // Calcular horas ya registradas para esta práctica
    const existingHours = await this.hoursRepo.find({ where: { practicaId: dto.practicaId } });
    const totalHours = existingHours.reduce((sum, h) => sum + h.horas, 0);

    // Validar que no exceda el total requerido
    if (totalHours + dto.horas > internship.horasTotalesRequeridas) {
      throw new BadRequestException(
        `No puedes registrar ${dto.horas} horas. Ya tienes ${totalHours} de ${internship.horasTotalesRequeridas} horas requeridas.`
      );
    }

    const tracking = this.hoursRepo.create(dto);
    const saved = await this.hoursRepo.save(tracking);
    // horasCompletadas se calcula dinámicamente desde seguimientos, no se guarda en BD
    return (saved as any) as HoursTracking;
  }

  async approveHoursTracking(id: number, role: 'empresa' | 'asesor'): Promise<HoursTracking> {
    const tracking = await this.hoursRepo.findOneBy({ id });
    if (!tracking) throw new NotFoundException('Registro de horas no encontrado');
    if (role === 'empresa') tracking.aprobadoEmpresa = true;
    else tracking.aprobadoAsesor = true;
    const updated = await this.hoursRepo.save(tracking);
    // horasCompletadas se calcula dinámicamente desde seguimientos, no se guarda en BD
    return updated;
  }

  // Informes
  async submitReport(dto: CreateInternshipReportDto): Promise<InternshipReport> {
    const internship = await this.findInternshipById(dto.practicaId);
    if (internship.estado !== InternshipEstado.ACTIVA && internship.estado !== InternshipEstado.EN_EVALUACION) {
      throw new BadRequestException('No se puede entregar informe en este estado');
    }
    const existing = await this.reportRepo.findOneBy({ practicaId: dto.practicaId, tipo: dto.tipo as any });
    if (existing) throw new BadRequestException(`Ya existe un informe ${dto.tipo} para esta práctica`);
    const report = this.reportRepo.create(dto);
    return (await this.reportRepo.save(report)) as any as InternshipReport;
  }

  async evaluateReport(id: number, estado: ReporteEstado, comentario: string): Promise<InternshipReport> {
    const report = await this.reportRepo.findOneBy({ id });
    if (!report) throw new NotFoundException('Informe no encontrado');
    report.estado = estado;
    report.comentarioAsesor = comentario;
    const updated = await this.reportRepo.save(report);
    // si el informe final es aprobado, cambiar estado de práctica a en_evaluacion final
    if (report.tipo === ReporteTipo.FINAL && estado === ReporteEstado.APROBADO) {
      await this.internshipRepo.update(report.practicaId, { estado: InternshipEstado.EN_EVALUACION });
    }
    return updated;
  }

  // Evaluación final
  async finalEvaluation(internshipId: number, dto: any): Promise<FinalEvaluation> {
    const internship = await this.findInternshipById(internshipId);
    if (internship.estado !== InternshipEstado.EN_EVALUACION) {
      throw new BadRequestException('La práctica no está en evaluación final');
    }
    const existing = await this.evalRepo.findOneBy({ practicaId: internshipId });
    if (existing) throw new BadRequestException('Ya existe una evaluación final');
    const evaluation = this.evalRepo.create({ practicaId: internshipId, ...dto });
    await this.evalRepo.save(evaluation);
    internship.estado = InternshipEstado.FINALIZADA;
    await this.internshipRepo.save(internship);
    return (evaluation as any) as FinalEvaluation;
  }
  async findAllInternships(filters?: { estado?: InternshipEstado; estudianteId?: number; empresaId?: number }): Promise<Internship[]> {
    // estudianteId no es una columna real, se obtiene via postulacion
    // empresaId tampoco es columna directa, se obtiene via oferta
    // Usar QueryBuilder con relaciones cargadas separadamente
    const query = this.internshipRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.postulacion', 'post')
      .leftJoinAndSelect('post.oferta', 'of')
      .leftJoinAndSelect('of.empresa', 'emp')
      .leftJoinAndSelect('i.asesorAcademico', 'aa')
      .leftJoinAndSelect('post.estudiante', 'est')
      .leftJoinAndSelect('est.usuario', 'usu');

    if (filters?.estado) {
      query.andWhere('i.estado = :estado', { estado: filters.estado });
    }

    if (filters?.estudianteId) {
      query.andWhere('post.estudiante_id = :estudianteId', { estudianteId: filters.estudianteId });
    }

    if (filters?.empresaId) {
      query.andWhere('of.empresa_id = :empresaId', { empresaId: filters.empresaId });
    }

    const internships = await query.getMany();

    // Mapear relaciones virtuales para compatibilidad
    return internships.map(i => {
      if (i.postulacion?.oferta?.empresa) {
        (i as any).empresa = i.postulacion.oferta.empresa;
      }
      if (i.postulacion?.estudiante) {
        (i as any).estudiante = i.postulacion.estudiante;
      }
      return i;
    });
  }
  
  async getMyInternship(estudianteId: number): Promise<Internship | null> {
    const internship = await this.internshipRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.postulacion', 'p')
      .leftJoinAndSelect('p.oferta', 'o')
      .leftJoinAndSelect('o.empresa', 'e')
      .leftJoinAndSelect('i.asesorAcademico', 'aa')
      .where('p.estudiante_id = :estudianteId', { estudianteId })
      .andWhere('i.estado = :estado', { estado: InternshipEstado.ACTIVA })
      .orderBy('i.id', 'DESC')
      .getOne();

    if (internship) {
      // Mapear empresa virtualmente para compatibilidad
      if (internship.postulacion?.oferta?.empresa) {
        (internship as any).empresa = internship.postulacion.oferta.empresa;
      }
      if (internship.postulacion?.estudiante) {
        (internship as any).estudiante = internship.postulacion.estudiante;
      }
    }
    return internship;
  }

  // Obtener postulaciones por empresa (a través de sus ofertas)
  async getApplicationsByCompany(empresaId: number): Promise<InternshipApplication[]> {
    try {
      // Obtener todas las ofertas de la empresa
      const ofertas = await this.offerRepo.find({
        where: { empresaId },
        select: ['id'],
      });
      const ofertaIds = ofertas.map(o => o.id);

      if (ofertaIds.length === 0) {
        return [];
      }

      // Usar QueryBuilder para evitar problemas con el operador IN
      const applications = await this.appRepo
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.oferta', 'oferta')
        .leftJoinAndSelect('app.estudiante', 'estudiante')
        .leftJoinAndSelect('estudiante.usuario', 'usuario')
        .leftJoinAndSelect('estudiante.carrera', 'carrera')
        .where('app.oferta_id IN (:...ofertaIds)', { ofertaIds })
        .orderBy('app.fecha_postulacion', 'DESC')
        .getMany();

      return applications;
    } catch (error) {
      console.error('Error en getApplicationsByCompany:', error);
      return [];
    }
  }

  // Estadísticas para el dashboard de empresa
  async getCompanyDashboardStats(empresaId: number): Promise<{
    totalOfertas: number;
    ofertasActivas: number;
    totalPostulaciones: number;
    postulacionesPendientes: number;
    practicasActivas: number;
    postulacionesAprobadas: number;
  }> {
    try {
      // Obtener todas las ofertas de la empresa
      const todasOfertas = await this.offerRepo.find({
        where: { empresaId },
        select: ['id', 'estado'],
      });
      
      // Total de ofertas (excluyendo canceladas) - calcular en memoria
      const totalOfertas = todasOfertas.filter(o => o.estado !== OfertaEstado.CANCELADA).length;
      
      // Ofertas activas (publicadas)
      const ofertasActivas = todasOfertas.filter(o => o.estado === OfertaEstado.PUBLICADA).length;

      const ofertaIds = todasOfertas.map(o => o.id);

      // Total de postulaciones a ofertas de la empresa
      let totalPostulaciones = 0;
      let postulacionesPendientes = 0;
      let postulacionesAprobadas = 0;

      if (ofertaIds.length > 0) {
        // Obtener todas las postulaciones de estas ofertas
        const postulaciones = await this.appRepo.find({
          where: { ofertaId: ofertaIds as any },
          select: ['estado'],
        });
        
        totalPostulaciones = postulaciones.length;
        postulacionesPendientes = postulaciones.filter(p => p.estado === ApplicationEstado.POSTULADO).length;
        postulacionesAprobadas = postulaciones.filter(p => p.estado === ApplicationEstado.APROBADO).length;
      }

      // Prácticas activas de la empresa - usar QueryBuilder para evitar problemas con enums
      let practicasActivas = 0;
      try {
        practicasActivas = await this.internshipRepo
          .createQueryBuilder('p')
          .where('p.empresa_id = :empresaId', { empresaId })
          .andWhere('p.estado = :estado', { estado: 'activa' })
          .getCount();
      } catch (err) {
        console.error('Error al contar prácticas activas:', err);
        practicasActivas = 0;
      }

      return {
        totalOfertas,
        ofertasActivas,
        totalPostulaciones,
        postulacionesPendientes,
        practicasActivas,
        postulacionesAprobadas,
      };
    } catch (error) {
      console.error('Error en getCompanyDashboardStats:', error);
      // Retornar valores por defecto en caso de error
      return {
        totalOfertas: 0,
        ofertasActivas: 0,
        totalPostulaciones: 0,
        postulacionesPendientes: 0,
        practicasActivas: 0,
        postulacionesAprobadas: 0,
      };
    }
  }

  // Obtener postulaciones de un estudiante específico
  async getApplicationsByStudent(estudianteId: number): Promise<InternshipApplication[]> {
    try {
      const applications = await this.appRepo
        .createQueryBuilder('app')
        .leftJoinAndSelect('app.oferta', 'oferta')
        .leftJoinAndSelect('oferta.empresa', 'empresa')
        .where('app.estudiante_id = :estudianteId', { estudianteId })
        .orderBy('app.fecha_postulacion', 'DESC')
        .getMany();

      return applications;
    } catch (error) {
      console.error('Error en getApplicationsByStudent:', error);
      return [];
    }
  }

  // Obtener prácticas asignadas a un asesor específico
  async getInternshipsByAdvisor(asesorId: number): Promise<Internship[]> {
    try {
      const internships = await this.internshipRepo
        .createQueryBuilder('i')
        .leftJoinAndSelect('i.postulacion', 'postulacion')
        .leftJoinAndSelect('postulacion.estudiante', 'estudiante')
        .leftJoinAndSelect('estudiante.usuario', 'usuario')
        .leftJoinAndSelect('estudiante.carrera', 'carrera')
        .leftJoinAndSelect('postulacion.oferta', 'oferta')
        .leftJoinAndSelect('oferta.empresa', 'empresa')
        .leftJoinAndSelect('i.asesorAcademico', 'asesorAcademico')
        .leftJoinAndSelect('i.informes', 'informes')
        .where('i.asesor_academico_id = :asesorId', { asesorId })
        .orderBy('i.fecha_inicio', 'DESC')
        .getMany();

      // Mapear relaciones virtuales para compatibilidad
      return internships.map(internship => {
        if (internship.postulacion?.oferta?.empresa) {
          (internship as any).empresa = internship.postulacion.oferta.empresa;
        }
        if (internship.postulacion?.estudiante) {
          (internship as any).estudiante = internship.postulacion.estudiante;
        }
        return internship;
      });
    } catch (error) {
      console.error('Error en getInternshipsByAdvisor:', error);
      return [];
    }
  }
}
