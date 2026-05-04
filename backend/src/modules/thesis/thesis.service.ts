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
import { NotificacionTipo } from '../notifications/entities/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateThesisProjectDto, UpdateThesisProjectDto } from './dto/thesis-project.dto';
import { CreateThesisAssignmentDto } from './dto/thesis-assignment.dto';
import { CreateDeliverableDto, SubmitDeliverableDto, ReviewDeliverableDto } from './dto/deliverable.dto';
import { User, RolUsuario } from '../users/entities/user.entity';
import { Teacher } from '../academic/entities/teacher.entity';

@Injectable()
export class ThesisService {
  constructor(
    @InjectRepository(ThesisProject) private projectRepo: Repository<ThesisProject>,
    @InjectRepository(ThesisAssignment) private assignmentRepo: Repository<ThesisAssignment>,
    @InjectRepository(Deliverable) private deliverableRepo: Repository<Deliverable>,
    @InjectRepository(DeliverableSubmission) private submissionRepo: Repository<DeliverableSubmission>,
    @InjectRepository(DefenseRecord) private defenseRepo: Repository<DefenseRecord>,
    @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
    @InjectRepository(User) private userRepo: Repository<User>,
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

  async updateProject(id: number, dto: UpdateThesisProjectDto, userFacultadId?: number, isAdmin = false): Promise<ThesisProject> {
    const project = await this.findProjectById(id);

    // Validar que el coordinador solo modifique proyectos de su facultad
    if (userFacultadId !== undefined) {
      const projectFacultadId = await this.getProjectFacultadId(id);
      if (projectFacultadId !== userFacultadId) {
        throw new ForbiddenException('No puedes modificar proyectos de otra facultad');
      }
    }

    if (dto.estado && !this.canTransition(project.estado, dto.estado, isAdmin)) {
      throw new BadRequestException(`Transición de estado no permitida: ${project.estado} -> ${dto.estado}`);
    }

    // Limpiar fecha de aprobación si se reactiva desde CULMINADO/DESAPROBADO
    if (isAdmin && (project.estado === ThesisEstado.CULMINADO || project.estado === ThesisEstado.DESAPROBADO)) {
      if (dto.estado === ThesisEstado.EN_REVISION || dto.estado === ThesisEstado.EN_DESARROLLO) {
        (dto as any).fechaAprobacion = null;
      }
    }

    await this.projectRepo.update(id, dto);
    if (dto.estado === ThesisEstado.APROBADO && !project.fechaAprobacion) {
      await this.projectRepo.update(id, { fechaAprobacion: new Date() });
    }
    return this.findProjectById(id);
  }

  // Obtener la facultad de un proyecto de tesis
  async getProjectFacultadId(projectId: number): Promise<number | null> {
    const result = await this.projectRepo.query(
      `SELECT c.facultad_id
       FROM proyecto_tesis pt
       INNER JOIN estudiante e ON e.id = pt.estudiante_id
       INNER JOIN carrera c ON c.id = e.carrera_id
       WHERE pt.id = $1`,
      [projectId]
    );
    return result?.[0]?.facultad_id || null;
  }

  private canTransition(from: ThesisEstado, to: ThesisEstado, isAdmin = false): boolean {
    const transitions: Record<ThesisEstado, ThesisEstado[]> = {
      [ThesisEstado.EN_REGISTRO]: [ThesisEstado.PROPUESTO, ThesisEstado.CANCELADO],
      [ThesisEstado.PROPUESTO]: [ThesisEstado.APROBADO, ThesisEstado.DESAPROBADO, ThesisEstado.CANCELADO],
      [ThesisEstado.APROBADO]: [ThesisEstado.EN_DESARROLLO],
      [ThesisEstado.EN_DESARROLLO]: [ThesisEstado.EN_REVISION, ThesisEstado.CANCELADO],
      [ThesisEstado.EN_REVISION]: [ThesisEstado.CULMINADO, ThesisEstado.EN_DESARROLLO, ThesisEstado.CANCELADO],
      [ThesisEstado.CULMINADO]: [],  // Solo admin puede reactivar
      [ThesisEstado.DESAPROBADO]: [], // Solo admin puede reactivar
      [ThesisEstado.CANCELADO]: [],   // Irreversible
    };

    // Admin puede reactivar proyectos culminados o desaprobados a revisión
    if (isAdmin && (from === ThesisEstado.CULMINADO || from === ThesisEstado.DESAPROBADO)) {
      return [ThesisEstado.EN_REVISION, ThesisEstado.EN_DESARROLLO].includes(to);
    }

    return from === to || transitions[from]?.includes(to) || false;
  }

  async findProjectById(id: number): Promise<ThesisProject> {
    const project = await this.projectRepo.findOne({ where: { id }, relations: ['asignaciones', 'entregables', 'acta'] });
    if (!project) throw new NotFoundException('Proyecto de tesis no encontrado');
    return project;
  }

  async findProjectsByStudent(studentId: number): Promise<ThesisProject[]> {
    return this.projectRepo.find({ where: { estudianteId: studentId }, relations: ['asignaciones'] });
  }

  async findAllProjects(filters?: { estado?: ThesisEstado; area?: string; incluirInactivos?: boolean; facultadId?: number }): Promise<ThesisProject[]> {
    const where: any = {};
    if (filters?.estado) where.estado = filters.estado;
    if (filters?.area) where.areaConocimiento = filters.area;
    // Por defecto, no mostrar proyectos inactivos (cancelados)
    if (!filters?.incluirInactivos) {
      where.activo = true;
    }

    // Construir query base
    const query = this.projectRepo
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.estudiante', 'estudiante')
      .leftJoinAndSelect('estudiante.usuario', 'usuario')
      .leftJoinAndSelect('estudiante.carrera', 'carrera')
      .leftJoinAndSelect('project.asignaciones', 'asignaciones')
      .leftJoinAndSelect('asignaciones.docente', 'docente');

    // Aplicar filtros de estado
    if (filters?.estado) {
      query.andWhere('project.estado = :estado', { estado: filters.estado });
    }
    if (filters?.area) {
      query.andWhere('project.area_conocimiento = :area', { area: filters.area });
    }
    if (!filters?.incluirInactivos) {
      query.andWhere('project.activo = :activo', { activo: true });
    }

    // Si se especifica facultad, filtrar por ella
    if (filters?.facultadId) {
      query.andWhere('carrera.facultad_id = :facultadId', { facultadId: filters.facultadId });
    }

    return query.getMany();
  }

  async deleteProject(id: number): Promise<void> {
    const project = await this.findProjectById(id);
    // Soft delete: cambiar estado a cancelado y desactivar
    project.estado = ThesisEstado.CANCELADO;
    project.activo = false;
    await this.projectRepo.save(project);
  }

  // Asignaciones (asesor/jurado)
  async addAssignment(dto: CreateThesisAssignmentDto): Promise<ThesisAssignment> {
    const project = await this.findProjectById(dto.proyectoId);

    // Validar estado del proyecto
    if (project.estado !== ThesisEstado.APROBADO && project.estado !== ThesisEstado.EN_DESARROLLO) {
      const estadoTexto = {
        [ThesisEstado.EN_REGISTRO]: 'en registro',
        [ThesisEstado.PROPUESTO]: 'propuesto',
        [ThesisEstado.APROBADO]: 'aprobado',
        [ThesisEstado.EN_DESARROLLO]: 'en desarrollo',
        [ThesisEstado.EN_REVISION]: 'en revisión',
        [ThesisEstado.CULMINADO]: 'culminado',
        [ThesisEstado.DESAPROBADO]: 'desaprobado',
        [ThesisEstado.CANCELADO]: 'cancelado',
      }[project.estado] || project.estado;
      throw new BadRequestException(`No se puede asignar docentes porque el proyecto está "${estadoTexto}". Solo se permiten asignaciones en proyectos aprobados o en desarrollo.`);
    }

    // Validar que el usuario sea un docente asesor
    const user = await this.usersService.findById(dto.docenteId);
    if (user.rol !== RolUsuario.ASESOR) {
      throw new BadRequestException(`${user.nombre} ${user.apellidoPaterno} no tiene el rol de asesor. Solo los docentes con rol de asesor pueden ser asignados.`);
    }

    // Buscar el docente por usuario_id para obtener el docente.id correcto
    const teacher = await this.teacherRepo.findOne({ where: { usuarioId: dto.docenteId } });
    if (!teacher) {
      throw new NotFoundException(`No se encontró el perfil de docente para el usuario ${dto.docenteId}`);
    }

    // Validar unique_asesor_tesis: mismo docente no puede estar en el mismo proyecto (independiente del tipo)
    const existingAnyType = await this.assignmentRepo.findOneBy({
      proyectoId: dto.proyectoId,
      docenteId: teacher.id,
    });
    if (existingAnyType) {
      throw new BadRequestException(`${user.nombre} ${user.apellidoPaterno} ya está asignado a este proyecto como ${existingAnyType.tipo}. Un docente no puede tener múltiples asignaciones en el mismo proyecto.`);
    }

    // Validar chk_rol_jurado: asesor no debe tener rol_jurado, jurado sí debe tenerlo
    if (dto.tipo === AsignacionTipo.ASESOR && dto.rolEspecifico) {
      throw new BadRequestException('Un asesor no puede tener un rol específico de jurado. Los roles específicos solo aplican a jurados.');
    }
    if (dto.tipo === AsignacionTipo.JURADO && !dto.rolEspecifico) {
      throw new BadRequestException('Debe especificar el rol específico del jurado (Presidente, Secretario o Vocal).');
    }

    const assignment = this.assignmentRepo.create({
      ...dto,
      proyectoId: Number(dto.proyectoId),
      docenteId: Number(teacher.id),
    });
    const saved = await this.assignmentRepo.save(assignment);

    // Notificar al docente (usar user.id que es el usuarioId correcto)
    await this.notificationsService.create({
      usuarioId: user.id,
      titulo: 'Asignación a tesis',
      mensaje: `Has sido asignado como ${dto.tipo}${dto.rolEspecifico ? ` (${dto.rolEspecifico})` : ''} del proyecto "${project.titulo}"`,
      tipo: NotificacionTipo.INFO,
    });
    return (saved as any) as ThesisAssignment;
  }

  async removeAssignment(id: number): Promise<{ message: string }> {
    await this.assignmentRepo.delete(id);
    return { message: 'Asignación eliminada exitosamente' };
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
    const assignments = await this.assignmentRepo.find({
      where: { proyectoId: project.id, tipo: AsignacionTipo.ASESOR },
      relations: ['docente']
    });
    for (const ass of assignments) {
      // Obtener el usuarioId del docente para enviar notificación correcta
      const teacher = await this.teacherRepo.findOne({ where: { id: ass.docenteId } });
      if (teacher?.usuarioId) {
        await this.notificationsService.create({
          usuarioId: teacher.usuarioId,
          titulo: 'Nueva entrega de tesis',
          mensaje: `El estudiante ha entregado "${deliverable.nombre}"`,
          tipo: NotificacionTipo.INFO,
        });
      }
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

    // Validar que haya retroalimentación al rechazar
    if (submission.estado === EntregaEstado.OBSERVADO && (!dto.retroalimentacion || dto.retroalimentacion.trim().length < 10)) {
      throw new BadRequestException('Debes proporcionar una retroalimentación de al menos 10 caracteres al rechazar el entregable');
    }

    submission.retroalimentacionAsesor = dto.retroalimentacion || '';
    const updated = await this.submissionRepo.save(submission);
    // Notificar al estudiante
    const project = submission.entregable.proyecto;
    await this.notificationsService.create({
      usuarioId: project.estudianteId,
      titulo: `Entrega ${submission.estado === EntregaEstado.APROBADO ? 'aprobada' : 'observada'}`,
      mensaje: `Tu entrega "${submission.entregable?.nombre || 'Sin nombre'}" ha sido ${submission.estado}. ${dto.retroalimentacion || ''}`,
      tipo: submission.estado === EntregaEstado.APROBADO ? NotificacionTipo.EXITO : NotificacionTipo.ADVERTENCIA,
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
    const saved = (await this.defenseRepo.save(record)) as any as DefenseRecord;
    project.estado = saved.resultado === ResultadoSustentacion.APROBADO ? ThesisEstado.CULMINADO : ThesisEstado.DESAPROBADO;
    await this.projectRepo.save(project);
    return saved;
  }
  async getStats(): Promise<{ total: number; enDesarrollo: number; culminados: number; porArea: any[] }> {
    const all = await this.findAllProjects();
    const enDesarrollo = all.filter(p => p.estado === ThesisEstado.EN_DESARROLLO).length;
    const culminados = all.filter(p => p.estado === ThesisEstado.CULMINADO).length;
    const porArea: Record<string, number> = {};
    all.forEach(p => {
      const area = p.areaConocimiento;
      porArea[area] = (porArea[area] || 0) + 1;
    });
    return {
      total: all.length,
      enDesarrollo,
      culminados,
      porArea: Object.entries(porArea).map(([area, count]) => ({ area, count })),
    };
  }

  // Obtener proyectos de tesis asignados a un asesor específico
  async getProjectsByAdvisor(docenteId: number): Promise<ThesisProject[]> {
    try {
      // Buscar proyectos donde el docente está asignado como asesor o jurado
      const projects = await this.projectRepo
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.estudiante', 'estudiante')
        .leftJoinAndSelect('estudiante.usuario', 'usuario')
        .leftJoinAndSelect('estudiante.carrera', 'carrera')
        .leftJoinAndSelect('project.asignaciones', 'asignaciones')
        .leftJoinAndSelect('asignaciones.docente', 'docente')
        .leftJoinAndSelect('project.entregables', 'entregables')
        .leftJoinAndSelect('entregables.entregas', 'entregas')
        .where('asignaciones.docente_id = :docenteId', { docenteId })
        .andWhere('project.activo = :activo', { activo: true })
        .orderBy('project.fecha_registro', 'DESC')
        .getMany();

      return projects;
    } catch (error) {
      console.error('Error en getProjectsByAdvisor:', error);
      return [];
    }
  }

  // Sugerir asesor (solo estudiante)
  async suggestAdvisor(projectId: number, asesorId: number, estudianteId: number): Promise<ThesisProject> {
    const project = await this.findProjectById(projectId);

    // Validar que el proyecto pertenezca al estudiante
    if (project.estudianteId !== estudianteId) {
      throw new ForbiddenException('No puedes sugerir asesor para este proyecto');
    }

    // Validar estado permitido para sugerir asesor
    const estadosPermitidos = [ThesisEstado.EN_REGISTRO, ThesisEstado.PROPUESTO, ThesisEstado.APROBADO];
    if (!estadosPermitidos.includes(project.estado)) {
      throw new BadRequestException(`No puedes sugerir asesor en estado "${project.estado}"`);
    }

    // Validar que el docente exista y tenga rol de asesor
    const advisor = await this.usersService.findById(asesorId);
    if (advisor.rol !== RolUsuario.ASESOR) {
      throw new BadRequestException('El usuario seleccionado no tiene rol de asesor');
    }

    // Guardar sugerencia
    project.asesorSugeridoId = asesorId;
    project.fechaSugerenciaAsesor = new Date();
    const updated = await this.projectRepo.save(project);

    // Notificar al coordinador de la facultad del estudiante
    try {
      const student = await this.studentsService.findById(project.estudianteId);
      if (!student) {
        console.warn(`Estudiante ${project.estudianteId} no encontrado para notificación`);
        return updated;
      }
      
      const studentName = `${student.usuario?.nombre || ''} ${student.usuario?.apellidoPaterno || ''}`.trim();
      const facultadId = student.carrera?.facultadId;
      
      if (!facultadId) {
        console.warn(`No se encontró facultad para el estudiante ${project.estudianteId}`);
        return updated;
      }

      // Buscar coordinadores de la facultad del estudiante
      const coordinadores = await this.userRepo.query(
        `SELECT u.id FROM usuario u
         INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
         INNER JOIN rol r ON r.id = ur.rol_id
         INNER JOIN docente d ON d.usuario_id = u.id
         INNER JOIN carrera c ON c.id = d.carrera_id
         WHERE r.nombre = 'Coordinador' AND c.facultad_id = $1`,
        [facultadId]
      );

      if (coordinadores.length === 0) {
        console.warn(`No se encontraron coordinadores para la facultad ${facultadId}`);
      }

      for (const coord of coordinadores) {
        await this.notificationsService.create({
          usuarioId: coord.id,
          titulo: 'Sugerencia de asesor recibida',
          mensaje: `${studentName} ha sugerido a ${advisor.nombre} ${advisor.apellidoPaterno} como asesor para su proyecto "${project.titulo}"`,
          tipo: NotificacionTipo.INFO,
        });
      }
    } catch (error) {
      console.error('Error notificando a coordinadores:', error);
    }

    return updated;
  }
}