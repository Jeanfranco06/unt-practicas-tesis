import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { InternshipOffer, OfertaEstado } from './entities/internship-offer.entity';
import { InternshipApplication, ApplicationEstado } from './entities/internship-application.entity';
import { Internship, InternshipEstado } from './entities/internship.entity';
import { HoursTracking } from './entities/hours-tracking.entity';
import { InternshipReport, ReporteTipo, ReporteEstado } from './entities/internship-report.entity';
import { FinalEvaluation } from './entities/final-evaluation.entity';
import { CompaniesService } from '../companies/companies.service';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import { AgreementsService } from '../agreements/agreements.service';
import { CreateInternshipOfferDto, UpdateInternshipOfferDto } from './dto/internship-offer.dto';
import { CreateApplicationDto, ReviewApplicationDto } from './dto/application.dto';
import { CreateHoursTrackingDto } from './dto/hours-tracking.dto';
import { CreateInternshipReportDto } from './dto/internship-report.dto';

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
    private studentsService: StudentsService,
    private usersService: UsersService,
    private agreementsService: AgreementsService,
  ) {}

  // Ofertas
  async createOffer(dto: CreateInternshipOfferDto): Promise<InternshipOffer> {
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
    await this.offerRepo.update(id, dto);
    return this.findOfferById(id);
  }

  async deleteOffer(id: number): Promise<{ success: boolean; message: string }> {
    const offer = await this.findOfferById(id);

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
    const offer = await this.offerRepo.findOne({ where: { id }, relations: ['empresa', 'convenio'] });
    if (!offer) throw new NotFoundException('Oferta no encontrada');
    
    // Calcular estado 'cerrada' dinámicamente si la oferta publicada venció
    const now = new Date();
    if (offer.estado === OfertaEstado.PUBLICADA && now > new Date(offer.fechaFinPostulacion)) {
      return { ...offer, estado: OfertaEstado.CERRADA as OfertaEstado };
    }
    return offer;
  }

  async findAllOffers(filters?: { empresaId?: number; estado?: OfertaEstado }): Promise<InternshipOffer[]> {
    const where: any = {};
    if (filters?.empresaId) where.empresaId = filters.empresaId;
    if (filters?.estado) {
      where.estado = filters.estado;
    }
    const offers = await this.offerRepo.find({ where, relations: ['empresa'] });
    
    // Calcular estado 'cerrada' dinámicamente para ofertas publicadas cuya vigencia terminó
    const now = new Date();
    return offers.map(offer => {
      if (offer.estado === OfertaEstado.PUBLICADA && now > new Date(offer.fechaFinPostulacion)) {
        return { ...offer, estado: OfertaEstado.CERRADA as OfertaEstado };
      }
      return offer;
    });
  }

  // Postulaciones
  async apply(dto: CreateApplicationDto): Promise<InternshipApplication> {
    const offer = await this.findOfferById(dto.ofertaId);
    if (offer.estado !== OfertaEstado.PUBLICADA) throw new BadRequestException('La oferta no está disponible');
    const now = new Date();
    if (now < offer.fechaInicioPostulacion || now > offer.fechaFinPostulacion) {
      throw new BadRequestException('Fuera del período de postulación');
    }
    const existing = await this.appRepo.findOneBy({ ofertaId: dto.ofertaId, estudianteId: dto.estudianteId });
    if (existing) throw new BadRequestException('Ya postulaste a esta oferta');
    await this.studentsService.findById(dto.estudianteId);
    const application = this.appRepo.create(dto);
    return this.appRepo.save(application);
  }

  async reviewApplication(id: number, reviewDto: ReviewApplicationDto, revisorId: number): Promise<InternshipApplication> {
    const app = await this.appRepo.findOne({ where: { id }, relations: ['oferta'] });
    if (!app) throw new NotFoundException('Postulación no encontrada');
    if (app.estado !== ApplicationEstado.POSTULADO && app.estado !== ApplicationEstado.PRESELECCIONADO) {
      throw new BadRequestException('La postulación ya fue revisada');
    }
    app.estado = reviewDto.estado;
    app.fechaRevision = new Date();
    app.revisadoPor = revisorId;
    const updated = await this.appRepo.save(app);

    // Si es aprobada, crear automáticamente la práctica
    if (reviewDto.estado === ApplicationEstado.APROBADO) {
      const existingInternship = await this.internshipRepo.findOneBy({ postulacionId: app.id });
      if (!existingInternship) {
        const offer = app.oferta;
        const internship = this.internshipRepo.create({
          postulacionId: app.id,
          estudianteId: app.estudianteId,
          empresaId: offer.empresaId,
          asesorAcademicoId: null, // pendiente asignación
          asesorEmpresaNombre: '',
          horasTotalesRequeridas: 240, // ejemplo, podría venir de configuración
          fechaInicio: offer.fechaInicioPractica,
          fechaFin: offer.fechaFinPractica,
          estado: InternshipEstado.PENDIENTE_ASIGNACION,
        });
        await this.internshipRepo.save(internship);
      }
    }
    return updated;
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
    const internship = await this.internshipRepo.findOne({ where: { id }, relations: ['estudiante', 'empresa', 'asesorAcademico'] });
    if (!internship) throw new NotFoundException('Práctica no encontrada');
    return internship;
  }

  // Seguimiento de horas
  async addHoursTracking(dto: CreateHoursTrackingDto): Promise<HoursTracking> {
    const internship = await this.findInternshipById(dto.practicaId);
    if (internship.estado !== InternshipEstado.ACTIVA) throw new BadRequestException('La práctica no está activa');
    const tracking = this.hoursRepo.create(dto);
    const saved = await this.hoursRepo.save(tracking);
    // recalcular horas completadas
    const totalHoras = await this.hoursRepo.sum('horas', { practicaId: dto.practicaId, aprobadoEmpresa: true, aprobadoAsesor: true });
    await this.internshipRepo.update(dto.practicaId, { horasCompletadas: totalHoras || 0 });
    return (saved as any) as HoursTracking;
  }

  async approveHoursTracking(id: number, role: 'empresa' | 'asesor'): Promise<HoursTracking> {
    const tracking = await this.hoursRepo.findOneBy({ id });
    if (!tracking) throw new NotFoundException('Registro de horas no encontrado');
    if (role === 'empresa') tracking.aprobadoEmpresa = true;
    else tracking.aprobadoAsesor = true;
    const updated = await this.hoursRepo.save(tracking);
    // si ambos aprobaron, sumar
    if (updated.aprobadoEmpresa && updated.aprobadoAsesor) {
      const internship = await this.findInternshipById(tracking.practicaId);
      const totalHoras = await this.hoursRepo.sum('horas', { practicaId: tracking.practicaId, aprobadoEmpresa: true, aprobadoAsesor: true });
      await this.internshipRepo.update(tracking.practicaId, { horasCompletadas: totalHoras || 0 });
    }
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
  async findAllInternships(filters?: { estado?: InternshipEstado; estudianteId?: number }): Promise<Internship[]> {
    const where: any = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.estudianteId) where.estudianteId = filters.estudianteId;
    return this.internshipRepo.find({ where, relations: ['estudiante', 'empresa', 'asesorAcademico'] });
  }
  
  async getMyInternship(estudianteId: number): Promise<Internship | null> {
    const internship = await this.internshipRepo.createQueryBuilder('i')
      .leftJoinAndSelect('i.postulacion', 'p')
      .leftJoinAndSelect('p.oferta', 'o')
      .leftJoinAndSelect('o.empresa', 'e')
      .leftJoinAndSelect('i.asesorAcademico', 'aa')
      .where('i.estudianteId = :estudianteId', { estudianteId })
      .andWhere('i.estado = :estado', { estado: InternshipEstado.ACTIVA })
      .orderBy('i.id', 'DESC')
      .getOne();

    if (internship) {
      if (!internship.empresaId && internship.postulacion?.oferta?.empresaId) {
        internship.empresaId = internship.postulacion.oferta.empresaId;
        await this.internshipRepo.save(internship);
      }
      if (internship.postulacion?.oferta?.empresa) {
        internship.empresa = internship.postulacion.oferta.empresa;
      }
    }
    return internship;
  }
}