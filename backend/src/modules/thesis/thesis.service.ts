import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThesisProject, ThesisEstado } from './entities/thesis-project.entity';
import { ThesisAssignment, AsignacionTipo, RolJurado } from './entities/thesis-assignment.entity';
import { Deliverable } from './entities/deliverable.entity';
import { DeliverableSubmission, EntregaEstado } from './entities/deliverable-submission.entity';
import { DefenseRecord, ResultadoSustentacion } from './entities/defense-record.entity';
import { StudentsService } from '../students/students.service';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateThesisProjectDto, UpdateThesisProjectDto } from './dto/thesis-project.dto';
import { CreateThesisAssignmentDto } from './dto/thesis-assignment.dto';
import { CreateDeliverableDto, SubmitDeliverableDto, ReviewDeliverableDto } from './dto/deliverable.dto';
import { RolUsuario } from '../users/entities/user.entity';

@Injectable()
export class ThesisService {
  constructor(
    @InjectRepository(ThesisProject) private projectRepo: Repository<ThesisProject>,
    @InjectRepository(ThesisAssignment) private assignmentRepo: Repository<ThesisAssignment>,
    @InjectRepository(Deliverable) private deliverableRepo: Repository<Deliverable>,
    @InjectRepository(DeliverableSubmission) private submissionRepo: Repository<DeliverableSubmission>,
    @InjectRepository(DefenseRecord) private defenseRepo: Repository<DefenseRecord>,
    private studentsService: StudentsService,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  // Proyectos
  async createProject(dto: CreateThesisProjectDto): Promise<ThesisProject> {
    await this.studentsService.findById(dto.estudianteId);
    const existing = await this.projectRepo.findOneBy({ estudianteId: dto.estudianteId });
    if (existing) throw new BadRequestException('El estudiante ya tiene un proyecto de tesis');
    const project = this.projectRepo.create({ ...dto, estado: ThesisEstado.EN_REGISTRO });
    return this.projectRepo.save(project);
  }

  async updateProject(id: number, dto: UpdateThesisProjectDto): Promise<ThesisProject> {
    const project = await this.findProjectById(id);
    if (dto.estado && !this.canTransition(project.estado, dto.estado)) {
      throw new BadRequestException(`Transición de estado no permitida: ${project.estado} -> ${dto.estado}`);
    }
    await this.projectRepo.update(id, dto);
    if (dto.estado === ThesisEstado.APROBADO && !project.fechaAprobacion) {
      await this.projectRepo.update(id, { fechaAprobacion: new Date() });
    }
    return this.findProjectById(id);
  }

  private canTransition(from: ThesisEstado, to: ThesisEstado): boolean {
    const transitions = {
      [ThesisEstado.EN_REGISTRO]: [ThesisEstado.PROPUESTO],
      [ThesisEstado.PROPUESTO]: [ThesisEstado.APROBADO, ThesisEstado.DESAPROBADO],
      [ThesisEstado.APROBADO]: [ThesisEstado.EN_DESARROLLO],
      [ThesisEstado.EN_DESARROLLO]: [ThesisEstado.EN_REVISION],
      [ThesisEstado.EN_REVISION]: [ThesisEstado.CULMINADO, ThesisEstado.EN_DESARROLLO],
      [ThesisEstado.CULMINADO]: [],
      [ThesisEstado.DESAPROBADO]: [],
    };
    return transitions[from]?.includes(to) || false;
  }

  async findProjectById(id: number): Promise<ThesisProject> {
    const project = await this.projectRepo.findOne({ where: { id }, relations: ['asignaciones', 'entregables', 'acta'] });
    if (!project) throw new NotFoundException('Proyecto de tesis no encontrado');
    return project;
  }

  async findProjectsByStudent(studentId: number): Promise<ThesisProject[]> {
    return this.projectRepo.find({ where: { estudianteId: studentId }, relations: ['asignaciones'] });
  }

  async findAllProjects(filters?: { estado?: ThesisEstado; area?: string }): Promise<ThesisProject[]> {
    const where: any = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.area) where.areaConocimiento = filters.area;
    return this.projectRepo.find({ where, relations: ['asignaciones'] });
  }

  // Asignaciones (asesor/jurado)
  async addAssignment(dto: CreateThesisAssignmentDto): Promise<ThesisAssignment> {
    const project = await this.findProjectById(dto.proyectoId);
    if (project.estado !== ThesisEstado.APROBADO && project.estado !== ThesisEstado.EN_DESARROLLO) {
      throw new BadRequestException('Solo se pueden asignar docentes a proyectos aprobados o en desarrollo');
    }
    const user = await this.usersService.findById(dto.docenteId);
    if (user.rol !== RolUsuario.ASESOR) throw new BadRequestException('El usuario no es un docente asesor');
    const existing = await this.assignmentRepo.findOneBy({ proyectoId: dto.proyectoId, docenteId: dto.docenteId, tipo: dto.tipo });
    if (existing) throw new BadRequestException('Este docente ya está asignado con ese tipo');
    const assignment = this.assignmentRepo.create(dto);
    const saved = await this.assignmentRepo.save(assignment);
    // Notificar al docente
    await this.notificationsService.create({
      usuarioId: dto.docenteId,
      titulo: 'Asignación a tesis',
      mensaje: `Has sido asignado como ${dto.tipo} del proyecto "${project.titulo}"`,
      tipo: 'info',
    });
    return saved;
  }

  async removeAssignment(id: number): Promise<void> {
    await this.assignmentRepo.delete(id);
  }

  // Entregables
  async createDeliverable(dto: CreateDeliverableDto): Promise<Deliverable> {
    const project = await this.findProjectById(dto.proyectoId);
    if (project.estado !== ThesisEstado.EN_DESARROLLO) {
      throw new BadRequestException('Solo se pueden definir entregables en desarrollo');
    }
    const deliverable = this.deliverableRepo.create(dto);
    return this.deliverableRepo.save(deliverable);
  }

  async submitDeliverable(dto: SubmitDeliverableDto, estudianteId: number): Promise<DeliverableSubmission> {
    const deliverable = await this.deliverableRepo.findOne({ where: { id: dto.entregableId }, relations: ['proyecto'] });
    if (!deliverable) throw new NotFoundException('Entregable no encontrado');
    const project = deliverable.proyecto;
    if (project.estado !== ThesisEstado.EN_DESARROLLO) throw new BadRequestException('No se puede entregar ahora');
    const existing = await this.submissionRepo.findOneBy({ entregableId: dto.entregableId, estudianteId });
    if (existing) throw new BadRequestException('Ya has entregado este entregable');
    const submission = this.submissionRepo.create({ ...dto, estudianteId, estado: EntregaEstado.ENTREGADO });
    const saved = await this.submissionRepo.save(submission);
    // Notificar a asesores y jurados
    const assignments = await this.assignmentRepo.find({ where: { proyectoId: project.id, tipo: AsignacionTipo.ASESOR } });
    for (const ass of assignments) {
      await this.notificationsService.create({
        usuarioId: ass.docenteId,
        titulo: 'Nueva entrega de tesis',
        mensaje: `El estudiante ha entregado "${deliverable.nombre}"`,
        tipo: 'info',
      });
    }
    return saved;
  }

  async reviewDeliverable(submissionId: number, dto: ReviewDeliverableDto, docenteId: number): Promise<DeliverableSubmission> {
    const submission = await this.submissionRepo.findOne({ where: { id: submissionId }, relations: ['entregable.proyecto'] });
    if (!submission) throw new NotFoundException('Entrega no encontrada');
    if (submission.estado !== EntregaEstado.ENTREGADO && submission.estado !== EntregaEstado.REVISANDO) {
      throw new BadRequestException('Esta entrega ya fue revisada');
    }
    submission.estado = dto.estado === 'aprobado' ? EntregaEstado.APROBADO : EntregaEstado.OBSERVADO;
    submission.retroalimentacionDocente = dto.retroalimentacion || null;
    const updated = await this.submissionRepo.save(submission);
    // Notificar al estudiante
    const project = submission.entregable.proyecto;
    await this.notificationsService.create({
      usuarioId: project.estudianteId,
      titulo: `Entrega ${submission.estado === EntregaEstado.APROBADO ? 'aprobada' : 'observada'}`,
      mensaje: `Tu entrega "${submission.tituloEntrega}" ha sido ${submission.estado}. ${dto.retroalimentacion || ''}`,
      tipo: submission.estado === EntregaEstado.APROBADO ? 'exito' : 'advertencia',
    });
    return updated;
  }

  // Acta de sustentación
  async createDefenseRecord(proyectoId: number, dto: any): Promise<DefenseRecord> {
    const project = await this.findProjectById(proyectoId);
    if (project.estado !== ThesisEstado.EN_REVISION) {
      throw new BadRequestException('El proyecto debe estar en revisión para sustentar');
    }
    const existing = await this.defenseRepo.findOneBy({ proyectoId });
    if (existing) throw new BadRequestException('Ya existe un acta para este proyecto');
    const record = this.defenseRepo.create({ proyectoId, ...dto });
    const saved = await this.defenseRepo.save(record);
    project.estado = saved.resultado === ResultadoSustentacion.APROBADO ? ThesisEstado.CULMINADO : ThesisEstado.DESAPROBADO;
    await this.projectRepo.save(project);
    return saved;
  }
  async getStats(): Promise<{ total: number; enDesarrollo: number; culminados: number; porArea: any[] }> {
    const all = await this.findAllProjects();
    const enDesarrollo = all.filter(p => p.estado === ThesisEstado.EN_DESARROLLO).length;
    const culminados = all.filter(p => p.estado === ThesisEstado.CULMINADO).length;
    const porArea = all.reduce((acc, p) => {
      const area = p.areaConocimiento;
      acc[area] = (acc[area] || 0) + 1;
      return acc;
    }, {});
    return {
      total: all.length,
      enDesarrollo,
      culminados,
      porArea: Object.entries(porArea).map(([area, count]) => ({ area, count })),
    };
  }
}