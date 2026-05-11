import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, RolUsuario } from './entities/user.entity';
import { Role, RoleName } from './entities/role.entity';
import { Student } from '../students/entities/student.entity';
import { Company } from '../companies/entities/company.entity';
import { Teacher } from '../academic/entities/teacher.entity';
import { CompanyRepresentative } from '../companies/entities/company-representative.entity';
import { Career } from '../academic/entities/career.entity';
import { PaginationDto, PaginatedResult, createPaginatedResult } from '../../common/dto/pagination.dto';
import { CreateStudentDto, CreateTeacherDto, CreateRepresentativeDto, CreateAdminDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Role) private roleRepo: Repository<Role>,
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Teacher) private teacherRepo: Repository<Teacher>,
    @InjectRepository(CompanyRepresentative) private representativeRepo: Repository<CompanyRepresentative>,
    @InjectRepository(Career) private careerRepo: Repository<Career>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userRepo.find({
      order: { creadoEn: 'DESC' }
    });

    // Cargar roles para cada usuario
    for (const user of users) {
      const roles = await this.getUserRoles(user.id);
      (user as any).roles = roles;
      user.rol = this.assignPrimaryRole(roles) as RolUsuario;
    }

    return users;
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id }
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Cargar roles para el usuario
    const roles = await this.getUserRoles(id);
    (user as any).roles = roles;
    user.rol = this.assignPrimaryRole(roles) as RolUsuario;

    return user;
  }

  async findByIdWithRoles(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    // Asignar roles vacíos temporalmente - la relación no está configurada
    (user as any).roles = [];
    return user;
  }

  /**
   * Obtener usuarios con paginación
   */
  async findAllPaginated(paginationDto: PaginationDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Obtener total de usuarios no eliminados
    const total = await this.userRepo.count({
      where: { eliminado: false }
    });

    // Obtener usuarios paginados
    const users = await this.userRepo.find({
      where: { eliminado: false },
      order: { creadoEn: 'DESC' },
      skip,
      take: limit,
    });

    // Cargar roles para cada usuario
    for (const user of users) {
      const roles = await this.getUserRoles(user.id);
      (user as any).roles = roles;
      user.rol = this.assignPrimaryRole(roles) as RolUsuario;
    }

    return createPaginatedResult(users, total, page, limit);
  }

  /**
   * Asigna el rol primario basado en prioridad:
   * ADMIN > COORDINADOR > ASESOR > ESTUDIANTE > REPRESENTANTE_EMPRESA
   */
  private assignPrimaryRole(roles: Role[]): RolUsuario | null {
    if (roles.length === 0) {
      return null;
    }

    const rolePriority: Record<string, number> = {
      [RoleName.ADMIN]: 0,
      [RoleName.COORDINADOR]: 1,  // Coordinador tiene mayor prioridad que Asesor
      [RoleName.ASESOR]: 2,
      [RoleName.SECRETARIA]: 3,
      [RoleName.ESTUDIANTE]: 4,
      [RoleName.REPRESENTANTE_EMPRESA]: 5,
    };

    // Ordenar roles por prioridad y retornar el primero
    const sortedRoles = [...roles].sort(
      (a, b) => (rolePriority[a.nombre] || 99) - (rolePriority[b.nombre] || 99)
    );
    return (sortedRoles[0].nombre as unknown) as RolUsuario;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { email } });
  }

  async findByEmailWithRoles(email: string): Promise<User | null> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (user) {
      (user as any).roles = [];
    }
    return user;
  }

  async findByRole(roleName: RoleName): Promise<User[]> {
    const result = await this.userRepo.query(
      `SELECT u.id, u.nombre, u.apellido_paterno AS "apellidoPaterno", u.apellido_materno AS "apellidoMaterno", u.email, d.id as "docenteId"
       FROM usuario u
       INNER JOIN usuario_rol ur ON ur.usuario_id = u.id
       INNER JOIN rol r ON r.id = ur.rol_id
       LEFT JOIN docente d ON d.usuario_id = u.id
       WHERE r.nombre = $1 AND r.activo = true AND u.activo = true
       ORDER BY u.apellido_paterno, u.nombre`,
      [roleName]
    );
    return result;
  }

  async create(createUserDto: any): Promise<User> {
    const user = this.userRepo.create(createUserDto as Partial<User>);
    return this.userRepo.save(user as User);
  }

  // =====================================================
  // MÉTODOS DE GENERACIÓN AUTOMÁTICA DE EMAIL
  // =====================================================

  /**
   * Genera username de 10 caracteres usando nombres y datos relevantes
   * Prioriza apellidos para mayor unicidad
   */
  private generate10CharUsername(nombre: string, apellidoPaterno: string, apellidoMaterno?: string, extraData?: string): string {
    const normalize = (str: string) => str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    const cleanNombre = normalize(nombre);
    const cleanApellidoPaterno = normalize(apellidoPaterno);
    const cleanApellidoMaterno = apellidoMaterno ? normalize(apellidoMaterno) : '';

    // 1. Primera letra del nombre
    let base = cleanNombre.charAt(0);

    // 2. Añadir todo el apellido paterno que quepa
    const remainingAfterFirst = 9 - base.length;
    base += cleanApellidoPaterno.substring(0, remainingAfterFirst);

    // 3. Si aún hay espacio, añadir apellido materno
    if (base.length < 10) {
      const remainingAfterPaterno = 10 - base.length;
      base += cleanApellidoMaterno.substring(0, remainingAfterPaterno);
    }

    // 4. Si aún necesitamos más caracteres, añadir números aleatorios
    if (base.length < 10) {
      const needed = 10 - base.length;
      const random = Math.floor(Math.random() * Math.pow(10, needed)).toString().padStart(needed, '0');
      base += random;
    }

    return base.substring(0, 10);
  }

  /**
   * Genera email institucional para estudiantes
   * Formato: XXXXXXXXXX@estudiante.com
   */
  private generateStudentEmail(nombre: string, apellidoPaterno: string, apellidoMaterno?: string, codigoUniversitario?: string): string {
    const username = this.generate10CharUsername(nombre, apellidoPaterno, apellidoMaterno, codigoUniversitario);
    return `${username}@estudiante.com`;
  }

  /**
   * Genera email institucional para docentes
   * Formato: XXXXXXXXXX@docente.com
   */
  private generateTeacherEmail(nombre: string, apellidoPaterno: string, apellidoMaterno?: string): string {
    const username = this.generate10CharUsername(nombre, apellidoPaterno, apellidoMaterno);
    return `${username}@docente.com`;
  }

  /**
   * Genera email institucional para coordinadores
   * Formato: XXXXXXXXXX@coordinador.com
   */
  private generateCoordinatorEmail(nombre: string, apellidoPaterno: string, apellidoMaterno?: string): string {
    const username = this.generate10CharUsername(nombre, apellidoPaterno, apellidoMaterno);
    return `${username}@coordinador.com`;
  }

  /**
   * Genera email para representantes de empresa
   * Formato: XXXXXXXXXX@representante.com
   */
  private generateRepresentativeEmail(nombre: string, apellidoPaterno: string, apellidoMaterno?: string, empresaNombre?: string): string {
    const username = this.generate10CharUsername(nombre, apellidoPaterno, apellidoMaterno, empresaNombre);
    return `${username}@representante.com`;
  }

  /**
   * Genera email para administradores
   * Formato: XXXXXXXXXX@admin.com
   */
  private generateAdminEmail(nombre: string, apellidoPaterno: string, apellidoMaterno?: string): string {
    const username = this.generate10CharUsername(nombre, apellidoPaterno, apellidoMaterno);
    return `${username}@admin.com`;
  }

  /**
   * Verifica si un email ya existe y genera alternativa si es necesario
   */
  private async generateUniqueEmail(
    baseEmail: string,
    suffix: string = ''
  ): Promise<string> {
    let email = baseEmail;
    let counter = 1;
    
    while (await this.findByEmail(email)) {
      const [localPart, domain] = baseEmail.split('@');
      email = `${localPart}${suffix}${counter}@${domain}`;
      counter++;
    }
    
    return email;
  }

  async assignRole(userId: number, roleId: number): Promise<void> {
    const user = await this.findById(userId);
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    
    if (!user || !role) {
      throw new NotFoundException('Usuario o rol no encontrado');
    }

    await this.userRepo
      .createQueryBuilder()
      .insert()
      .into('usuario_rol')
      .values({ usuario_id: userId, rol_id: roleId })
      .orIgnore()
      .execute();
  }

  async removeRole(userId: number, roleId: number): Promise<void> {
    await this.userRepo
      .createQueryBuilder()
      .delete()
      .from('usuario_rol')
      .where('usuario_id = :userId AND rol_id = :roleId', { userId, roleId })
      .execute();
  }

  async createStudentProfile(userId: number, carreraId?: number): Promise<Student> {
    // Generar código universitario aleatorio único
    const year = new Date().getFullYear();
    const random = Math.floor(10000 + Math.random() * 90000);
    const codigoUniversitario = `${year}${random}`;

    // Si no se especifica carrera, usar la primera disponible
    let defaultCarreraId = carreraId;
    if (!defaultCarreraId) {
      const firstCareer = await this.careerRepo.findOne({ where: { activo: true } });
      defaultCarreraId = firstCareer?.id;
    }

    const student = this.studentRepo.create({
      usuarioId: userId,
      codigoUniversitario,
      anioIngreso: year,
      carreraId: defaultCarreraId,
      creditosAprobados: 0,
      activo: true,
    });
    return this.studentRepo.save(student);
  }

  async createTeacherProfile(userId: number, carreraId?: number, especialidad?: string): Promise<Teacher> {
    // Si no se especifica carrera, usar la primera disponible
    let defaultCarreraId = carreraId;
    if (!defaultCarreraId) {
      const firstCareer = await this.careerRepo.findOne({ where: { activo: true } });
      defaultCarreraId = firstCareer?.id;
    }

    const teacher = this.teacherRepo.create({
      usuarioId: userId,
      carreraId: defaultCarreraId,
      especialidad: especialidad || 'Especialidad por definir',
    });
    return this.teacherRepo.save(teacher);
  }

  async createCompanyRepresentative(userId: number, empresaId: number, cargo?: string): Promise<CompanyRepresentative> {
    const representative = this.representativeRepo.create({
      empresaId,
      usuarioId: userId,
      cargo: cargo || 'Representante',
      esPrincipal: false,
    });
    return this.representativeRepo.save(representative);
  }

  async update(id: number, updateUserDto: any): Promise<User> {
    await this.userRepo.update(id, updateUserDto);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Usuario no encontrado después de actualizar');
    }
    return updated;
  }

  async updateRefreshToken(userId: number, refreshToken: string | null): Promise<void> {
    const refreshTokenExpira = refreshToken 
      ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 días
      : null;
    
    await this.userRepo.update(userId, { 
      refreshToken,
      refreshTokenExpira 
    } as any);
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    const user = await this.userRepo.findOne({ 
      where: { id: userId },
      select: ['refreshToken']
    });
    return user?.refreshToken || null;
  }

  async isRefreshTokenValid(userId: number, token: string): Promise<boolean> {
    const storedToken = await this.getRefreshToken(userId);
    if (!storedToken || storedToken !== token) {
      return false;
    }
    
    // Verificar si el token no ha expirado
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['refreshTokenExpira']
    });
    
    if (!user?.refreshTokenExpira) {
      return false;
    }
    
    return new Date(user.refreshTokenExpira) > new Date();
  }

  async remove(id: number): Promise<void> {
    await this.userRepo.delete(id);
  }

  async getUserRoles(userId: number): Promise<Role[]> {
    // Obtener roles del usuario desde la tabla usuario_rol
    const result = await this.userRepo.query(
      `SELECT r.id, r.nombre, r.descripcion, r.activo
       FROM rol r
       INNER JOIN usuario_rol ur ON ur.rol_id = r.id
       WHERE ur.usuario_id = $1 AND r.activo = true`,
      [userId]
    );
    return result.map((row: any) => ({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      activo: row.activo,
    }));
  }

  async hasRole(userId: number, roleName: RoleName): Promise<boolean> {
    const roles = await this.getUserRoles(userId);
    return roles.some(role => role.nombre === roleName);
  }

  // Métodos específicos para creación de usuarios

  async createStudent(createStudentDto: CreateStudentDto) {
    const hashedPassword = await bcrypt.hash(createStudentDto.contrasena, 10);
    
    // Verificar si la carrera existe
    const career = await this.careerRepo.findOne({ where: { id: createStudentDto.carreraId } });
    if (!career) {
      throw new BadRequestException('La carrera especificada no existe');
    }

    // Generar código universitario automático
    const codigoUniversitario = await this.generateCodigoUniversitario(career, createStudentDto.anioIngreso);
    
    // Generar email institucional automáticamente para estudiantes
    const generatedEmail = await this.generateUniqueEmail(
      this.generateStudentEmail(
        createStudentDto.nombre, 
        createStudentDto.apellidoPaterno, 
        createStudentDto.apellidoMaterno,
        codigoUniversitario
      )
    );

    // Crear usuario base
    const user = this.userRepo.create({
      email: generatedEmail,
      emailRecuperacion: createStudentDto.emailRecuperacion,
      contrasenaHash: hashedPassword,
      nombre: createStudentDto.nombre,
      apellidoPaterno: createStudentDto.apellidoPaterno,
      apellidoMaterno: createStudentDto.apellidoMaterno,
      activo: createStudentDto.activo,
    });
    const savedUser = await this.userRepo.save(user);

    const escuelaProfesional = this.getEscuelaProfesional(career);

    // Crear perfil de estudiante
    const student = this.studentRepo.create({
      usuarioId: savedUser.id,
      carreraId: createStudentDto.carreraId,
      anioIngreso: createStudentDto.anioIngreso,
      codigoUniversitario,
      escuelaProfesional,
      activo: true,
    });
    await this.studentRepo.save(student);

    // Asignar rol de estudiante
    const studentRole = await this.roleRepo.findOne({ where: { nombre: RoleName.ESTUDIANTE } });
    if (studentRole) {
      await this.assignRole(savedUser.id, studentRole.id);
    }

    return {
      user: savedUser,
      student,
      codigoUniversitario,
      escuelaProfesional,
    };
  }

  async createTeacher(createTeacherDto: CreateTeacherDto) {
    const hashedPassword = await bcrypt.hash(createTeacherDto.contrasena, 10);
    
    // Verificar si la carrera existe
    const career = await this.careerRepo.findOne({ where: { id: createTeacherDto.carreraId } });
    if (!career) {
      throw new BadRequestException('La carrera especificada no existe');
    }

    // Validar que al menos un rol esté seleccionado
    if (!createTeacherDto.roles.asesor && !createTeacherDto.roles.coordinador) {
      throw new BadRequestException('Debe seleccionar al menos un rol (ASESOR o COORDINADOR)');
    }

    // Generar email institucional automáticamente para docentes
    const generatedEmail = await this.generateUniqueEmail(
      this.generateTeacherEmail(
        createTeacherDto.nombre, 
        createTeacherDto.apellidoPaterno, 
        createTeacherDto.apellidoMaterno
      )
    );

    // Crear usuario base
    const user = this.userRepo.create({
      email: generatedEmail,
      emailRecuperacion: createTeacherDto.emailRecuperacion,
      contrasenaHash: hashedPassword,
      nombre: createTeacherDto.nombre,
      apellidoPaterno: createTeacherDto.apellidoPaterno,
      apellidoMaterno: createTeacherDto.apellidoMaterno,
      activo: createTeacherDto.activo,
    });
    const savedUser = await this.userRepo.save(user);

    // Crear perfil de docente
    const teacher = this.teacherRepo.create({
      usuarioId: savedUser.id,
      carreraId: createTeacherDto.carreraId,
      especialidad: createTeacherDto.especialidad,
      categoria: createTeacherDto.categoria,
      dedicacion: createTeacherDto.dedicacion,
      oficina: createTeacherDto.oficina,
      telefono: createTeacherDto.telefono,
    });
    await this.teacherRepo.save(teacher);

    // Asignar roles seleccionados
    if (createTeacherDto.roles.asesor) {
      const asesorRole = await this.roleRepo.findOne({ where: { nombre: RoleName.ASESOR } });
      if (asesorRole) {
        await this.assignRole(savedUser.id, asesorRole.id);
      }
    }

    if (createTeacherDto.roles.coordinador) {
      const coordinadorRole = await this.roleRepo.findOne({ where: { nombre: RoleName.COORDINADOR } });
      if (coordinadorRole) {
        await this.assignRole(savedUser.id, coordinadorRole.id);
      }
    }

    return {
      user: savedUser,
      teacher,
      roles: createTeacherDto.roles,
    };
  }

  async createRepresentative(createRepresentativeDto: CreateRepresentativeDto) {
    const hashedPassword = await bcrypt.hash(createRepresentativeDto.contrasena, 10);
    
    // Verificar si la empresa existe
    const company = await this.companyRepo.findOne({ where: { id: createRepresentativeDto.empresaId } });
    if (!company) {
      throw new BadRequestException('La empresa especificada no existe');
    }

    // Generar email automáticamente para representantes de empresa
    const generatedEmail = await this.generateUniqueEmail(
      this.generateRepresentativeEmail(
        createRepresentativeDto.nombre,
        createRepresentativeDto.apellidoPaterno,
        createRepresentativeDto.apellidoMaterno,
        company.razonSocial
      )
    );

    // Crear usuario base
    const user = this.userRepo.create({
      email: generatedEmail,
      emailRecuperacion: createRepresentativeDto.emailRecuperacion,
      contrasenaHash: hashedPassword,
      nombre: createRepresentativeDto.nombre,
      apellidoPaterno: createRepresentativeDto.apellidoPaterno,
      apellidoMaterno: createRepresentativeDto.apellidoMaterno,
      activo: createRepresentativeDto.activo,
    });
    const savedUser = await this.userRepo.save(user);

    // Crear perfil de representante
    const representative = this.representativeRepo.create({
      usuarioId: savedUser.id,
      empresaId: createRepresentativeDto.empresaId,
      cargo: createRepresentativeDto.cargo,
      departamento: createRepresentativeDto.departamento,
      telefonoDirecto: createRepresentativeDto.telefonoDirecto,
      esPrincipal: createRepresentativeDto.esPrincipal,
    });
    await this.representativeRepo.save(representative);

    // Asignar rol de representante
    const representativeRole = await this.roleRepo.findOne({ where: { nombre: RoleName.REPRESENTANTE_EMPRESA } });
    if (representativeRole) {
      await this.assignRole(savedUser.id, representativeRole.id);
    }

    return {
      user: savedUser,
      representative,
      company,
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(createAdminDto.contrasena, 10);

    // Generar email para administrador
    const generatedEmail = await this.generateUniqueEmail(
      this.generateAdminEmail(
        createAdminDto.nombre,
        createAdminDto.apellidoPaterno,
        createAdminDto.apellidoMaterno
      )
    );

    // Crear usuario base
    const user = this.userRepo.create({
      email: generatedEmail,
      emailRecuperacion: createAdminDto.emailRecuperacion,
      contrasenaHash: hashedPassword,
      nombre: createAdminDto.nombre,
      apellidoPaterno: createAdminDto.apellidoPaterno,
      apellidoMaterno: createAdminDto.apellidoMaterno,
      activo: createAdminDto.activo,
    });
    const savedUser = await this.userRepo.save(user);

    // Asignar rol de administrador (no requiere perfil adicional)
    const adminRole = await this.roleRepo.findOne({ where: { nombre: RoleName.ADMIN } });
    if (adminRole) {
      await this.assignRole(savedUser.id, adminRole.id);
    }

    return {
      user: savedUser,
    };
  }

  async createBaseUser(createBaseUserDto: any) {
    const hashedPassword = await bcrypt.hash(createBaseUserDto.contrasena, 10);

    // Generar email genérico para usuario base
    const generatedEmail = await this.generateUniqueEmail(
      this.generate10CharUsername(
        createBaseUserDto.nombre,
        createBaseUserDto.apellidoPaterno,
        createBaseUserDto.apellidoMaterno
      ) + '@user.com'
    );

    // Crear usuario base SIN asignar ningún rol
    const user = this.userRepo.create({
      email: generatedEmail,
      emailRecuperacion: createBaseUserDto.emailRecuperacion,
      contrasenaHash: hashedPassword,
      nombre: createBaseUserDto.nombre,
      apellidoPaterno: createBaseUserDto.apellidoPaterno,
      apellidoMaterno: createBaseUserDto.apellidoMaterno,
      activo: createBaseUserDto.activo,
    });
    const savedUser = await this.userRepo.save(user);

    // NO se asigna ningún rol - el usuario no puede iniciar sesión hasta tener un rol

    return {
      user: savedUser,
      message: 'Usuario base creado. No puede iniciar sesión hasta que se le asigne un rol.',
    };
  }

  async getCareers() {
    return this.careerRepo.find({
      select: ['id', 'nombre'],
      where: { activo: true },
      order: { nombre: 'ASC' },
    });
  }

  async getCompanies() {
    return this.companyRepo.find({
      select: ['id', 'ruc', 'razonSocial', 'nombreComercial'],
      where: { activo: true },
      order: { razonSocial: 'ASC' },
    });
  }

  // Métodos auxiliares
  private async generateCodigoUniversitario(career: Career, anioIngreso: number): Promise<string> {
    const careerCode = career.nombre.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const codigo = `${anioIngreso}${careerCode}${random}`;

      // Verificar que el código no exista
      const existing = await this.studentRepo.findOne({ where: { codigoUniversitario: codigo } });
      if (!existing) {
        return codigo;
      }
      attempts++;
    }

    // Si se agotaron los intentos, usar timestamp para garantizar unicidad
    const timestamp = Date.now().toString().slice(-4);
    return `${anioIngreso}${careerCode}${timestamp}`;
  }

  private getEscuelaProfesional(career: Career): string {
    // Lógica para determinar la escuela profesional según la carrera
    // Esto puede ser configurado según las reglas de la UNT
    return `Escuela de ${career.nombre}`;
  }

  // Métodos para vinculación flexible de usuarios a perfiles

  async getUsersWithoutProfile(profileType: string) {
    let query = this.userRepo.createQueryBuilder('user')
      .where('user.activo = :activo', { activo: true });

    switch (profileType) {
      case 'student':
        query = query.andWhere('user.id NOT IN (SELECT usuario_id FROM estudiante)');
        break;
      case 'teacher':
        query = query.andWhere('user.id NOT IN (SELECT usuario_id FROM docente)');
        break;
      case 'representative':
        query = query.andWhere('user.id NOT IN (SELECT usuario_id FROM representante_empresa)');
        break;
      default:
        throw new BadRequestException('Tipo de perfil no válido');
    }

    const users = await query
      .select(['user.id', 'user.email', 'user.nombre', 'user.apellidoPaterno', 'user.apellidoMaterno'])
      .getMany();

    const usersWithRoles = [];
    for (const user of users) {
      const roles = await this.getUserRoles(user.id);
      const rol = this.assignPrimaryRole(roles);
      usersWithRoles.push({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellidoPaterno: user.apellidoPaterno,
        apellidoMaterno: user.apellidoMaterno,
        apellido: user.apellidoPaterno,
        rol: rol,
        fullName: `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`,
      });
    }

    return usersWithRoles;
  }

  async linkUserToStudent(userId: number, studentData: any) {
    // Verificar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Verificar que el usuario no tenga ya un perfil de estudiante
    const existingStudent = await this.studentRepo.findOne({ where: { usuarioId: userId } });
    if (existingStudent) {
      throw new BadRequestException('El usuario ya tiene un perfil de estudiante');
    }

    // Verificar que la carrera existe
    const career = await this.careerRepo.findOne({ where: { id: studentData.carreraId } });
    if (!career) {
      throw new BadRequestException('La carrera especificada no existe');
    }

    // Generar código universitario y escuela profesional
    const codigoUniversitario = await this.generateCodigoUniversitario(career, studentData.anioIngreso);
    const escuelaProfesional = this.getEscuelaProfesional(career);

    // Crear perfil de estudiante
    const student = this.studentRepo.create({
      usuarioId: userId,
      carreraId: studentData.carreraId,
      anioIngreso: studentData.anioIngreso,
      codigoUniversitario,
      escuelaProfesional,
      activo: studentData.activo ?? true,
    });
    await this.studentRepo.save(student);

    // Asignar rol de estudiante
    const studentRole = await this.roleRepo.findOne({ where: { nombre: RoleName.ESTUDIANTE } });
    if (studentRole) {
      await this.assignRole(userId, studentRole.id);
    }

    return {
      user,
      student,
      codigoUniversitario,
      escuelaProfesional,
    };
  }

  async linkUserToTeacher(userId: number, teacherData: any) {
    // Verificar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Verificar que el usuario no tenga ya un perfil de docente
    const existingTeacher = await this.teacherRepo.findOne({ where: { usuarioId: userId } });
    if (existingTeacher) {
      throw new BadRequestException('El usuario ya tiene un perfil de docente');
    }

    // Verificar que la carrera existe
    const career = await this.careerRepo.findOne({ where: { id: teacherData.carreraId } });
    if (!career) {
      throw new BadRequestException('La carrera especificada no existe');
    }

    // Validar que al menos un rol esté seleccionado
    if (!teacherData.roles.asesor && !teacherData.roles.coordinador) {
      throw new BadRequestException('Debe seleccionar al menos un rol (ASESOR o COORDINADOR)');
    }

    // Crear perfil de docente
    const teacher = this.teacherRepo.create({
      usuarioId: userId,
      carreraId: teacherData.carreraId,
      especialidad: teacherData.especialidad,
      categoria: teacherData.categoria,
      dedicacion: teacherData.dedicacion,
      oficina: teacherData.oficina,
      telefono: teacherData.telefono,
    });
    await this.teacherRepo.save(teacher);

    // Asignar roles seleccionados
    if (teacherData.roles.asesor) {
      const asesorRole = await this.roleRepo.findOne({ where: { nombre: RoleName.ASESOR } });
      if (asesorRole) {
        await this.assignRole(userId, asesorRole.id);
      }
    }

    if (teacherData.roles.coordinador) {
      const coordinadorRole = await this.roleRepo.findOne({ where: { nombre: RoleName.COORDINADOR } });
      if (coordinadorRole) {
        await this.assignRole(userId, coordinadorRole.id);
      }
    }

    return {
      user,
      teacher,
      roles: teacherData.roles,
    };
  }

  async linkUserToRepresentative(userId: number, representativeData: any) {
    // Verificar que el usuario existe
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Verificar que el usuario no tenga ya un perfil de representante
    const existingRepresentative = await this.representativeRepo.findOne({ where: { usuarioId: userId } });
    if (existingRepresentative) {
      throw new BadRequestException('El usuario ya tiene un perfil de representante');
    }

    // Verificar que la empresa existe
    const company = await this.companyRepo.findOne({ where: { id: representativeData.empresaId } });
    if (!company) {
      throw new BadRequestException('La empresa especificada no existe');
    }

    // Crear perfil de representante
    const representative = this.representativeRepo.create({
      usuarioId: userId,
      empresaId: representativeData.empresaId,
      cargo: representativeData.cargo,
      departamento: representativeData.departamento,
      telefonoDirecto: representativeData.telefonoDirecto,
      esPrincipal: representativeData.esPrincipal,
    });
    await this.representativeRepo.save(representative);

    // Asignar rol de representante
    const representativeRole = await this.roleRepo.findOne({ where: { nombre: RoleName.REPRESENTANTE_EMPRESA } });
    if (representativeRole) {
      await this.assignRole(userId, representativeRole.id);
    }

    return {
      user,
      representative,
      company,
    };
  }
}