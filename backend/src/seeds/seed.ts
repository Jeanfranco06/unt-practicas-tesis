import { DataSource } from 'typeorm';
import { User, RolUsuario } from '../modules/users/entities/user.entity';
import { Student } from '../modules/students/entities/student.entity';
import { Company } from '../modules/companies/entities/company.entity';
import { InternshipOffer, OfertaEstado } from '../modules/internships/entities/internship-offer.entity';
import { ThesisProject, ThesisEstado } from '../modules/thesis/entities/thesis-project.entity';
import { InternshipApplication, ApplicationEstado } from '../modules/internships/entities/internship-application.entity';
import { Internship, InternshipEstado } from '../modules/internships/entities/internship.entity';
import * as bcrypt from 'bcrypt';

export async function seed(db: DataSource) {
  const userRepo = db.getRepository(User);
  const studentRepo = db.getRepository(Student);
  const companyRepo = db.getRepository(Company);
  const offerRepo = db.getRepository(InternshipOffer);
  const thesisRepo = db.getRepository(ThesisProject);
  const applicationRepo = db.getRepository(InternshipApplication);
  const internshipRepo = db.getRepository(Internship);

  const hashedPassword = await bcrypt.hash('123456', 10);

  // ==================== USUARIOS REALISTAS ====================
  const testUsers = [
    {
      email: 'admin@unt.edu.pe',
      nombre: 'Luis',
      apellidoPaterno: 'Mendoza',
      apellidoMaterno: 'Vargas',
      rol: RolUsuario.ADMIN,
    },
    {
      email: 'coordinador@unt.edu.pe',
      nombre: 'María',
      apellidoPaterno: 'García',
      apellidoMaterno: 'López',
      rol: RolUsuario.COORDINADOR,
    },
    {
      email: 'asesor@unt.edu.pe',
      nombre: 'Dr. Pedro',
      apellidoPaterno: 'Ramírez',
      apellidoMaterno: 'Torres',
      rol: RolUsuario.ASESOR,
    },
    {
      email: 'estudiante@unt.edu.pe',
      nombre: 'Juan',
      apellidoPaterno: 'Pérez',
      apellidoMaterno: 'Herrera',
      rol: RolUsuario.ESTUDIANTE,
    },
    {
      email: 'representante@empresa.pe',
      nombre: 'Roberto',
      apellidoPaterno: 'Sánchez',
      apellidoMaterno: 'Castillo',
      rol: RolUsuario.REPRESENTANTE_EMPRESA,
    },
  ];

  const createdUsers: { [key: string]: User } = {};

  // Crear usuarios
  for (const userData of testUsers) {
    let user = await userRepo.findOneBy({ email: userData.email });
    if (!user) {
      user = userRepo.create({
        email: userData.email,
        contrasenaHash: hashedPassword,
        nombre: userData.nombre,
        apellidoPaterno: userData.apellidoPaterno,
        apellidoMaterno: userData.apellidoMaterno,
        rol: userData.rol,
        activo: true,
      });
      await userRepo.save(user);
      createdUsers[userData.rol] = user;
      console.log(`✓ Usuario creado: ${userData.email} (${userData.rol})`);
    } else {
      createdUsers[userData.rol] = user;
    }

    // Crear perfil de estudiante con datos realistas
    if (userData.rol === RolUsuario.ESTUDIANTE && user) {
      let student = await studentRepo.findOneBy({ usuarioId: user.id });
      if (!student) {
        student = studentRepo.create({
          usuarioId: user.id,
          codigoUniversitario: '2022010234',
          anioIngreso: 2022,
          escuelaProfesional: 'Ingeniería de Sistemas',
          creditosAprobados: 145,
          promedioGeneral: 15.8,
        });
        await studentRepo.save(student);
        console.log(`✓ Perfil de estudiante creado: ${userData.nombre} ${userData.apellidoPaterno}`);
      }
    }
  }

  // ==================== EMPRESAS REALISTAS ====================
  const companies = [
    {
      ruc: '20601234567',
      razonSocial: 'Desarrollo Digital Perú S.A.C.',
      nombreComercial: 'DigeSoft',
      direccion: 'Av. República de Panamá 3410, San Isidro, Lima',
      sector: 'Tecnología y Desarrollo de Software',
      representanteLegal: createdUsers[RolUsuario.REPRESENTANTE_EMPRESA]?.id,
      telefono: '+51 1 612 3456',
      email: 'contacto@digesoft.pe',
      web: 'www.digesoft.pe',
      descripcion: 'Empresa líder en desarrollo de soluciones digitales y software a medida para el sector empresarial peruano.',
      activo: true,
    },
    {
      ruc: '20549876543',
      razonSocial: 'Soluciones Informáticas del Norte E.I.R.L.',
      nombreComercial: 'SI Norte',
      direccion: 'Av. Larco 1234, Trujillo',
      sector: 'Consultoría TI',
      representanteLegal: createdUsers[RolUsuario.REPRESENTANTE_EMPRESA]?.id,
      telefono: '+51 44 234 567',
      email: 'info@sinorte.pe',
      web: 'www.sinorte.pe',
      descripcion: 'Empresa trujillana especializada en consultoría tecnológica y desarrollo de sistemas empresariales.',
      activo: true,
    },
  ];

  const createdCompanies: Company[] = [];

  for (const companyData of companies) {
    let company = await companyRepo.findOneBy({ ruc: companyData.ruc });
    if (!company) {
      company = companyRepo.create(companyData);
      await companyRepo.save(company);
      createdCompanies.push(company);
      console.log(`✓ Empresa creada: ${companyData.nombreComercial}`);
    } else {
      createdCompanies.push(company);
    }
  }

  // ==================== OFERTAS DE PRÁCTICA REALISTAS ====================
  const ofertas = [
    {
      empresaId: createdCompanies[0]?.id,
      titulo: 'Practicante Preprofesional en Desarrollo Frontend',
      descripcion: 'Buscamos estudiante de ingeniería de sistemas o carreras afines para desarrollar interfaces web modernas utilizando React, TypeScript y Tailwind CSS. El practicante trabajará en proyectos reales de clientes nacionales.',
      requisitos: '- Estudiante de 7mo a 10mo ciclo de Ingeniería de Sistemas\n- Conocimientos de React, JavaScript/TypeScript\n- Familiaridad con control de versiones (Git)\n- Disposición para aprender y trabajo en equipo',
      conocimientos: ['React', 'TypeScript', 'Tailwind CSS', 'Git', 'HTML5/CSS3'],
      beneficios: '- Pago de S/ 1,200 mensuales\n- Capacitación continua\n- Posibilidad de permanencia\n- Horario flexible (mínimo 6 horas diarias)',
      fechaInicioPostulacion: new Date('2024-11-01'),
      fechaFinPostulacion: new Date('2024-12-15'),
      fechaInicioPractica: new Date('2025-01-06'),
      fechaFinPractica: new Date('2025-04-06'),
      cupos: 2,
      horasDiarias: 8,
      estado: OfertaEstado.PUBLICADA,
    },
    {
      empresaId: createdCompanies[0]?.id,
      titulo: 'Practicante en Desarrollo Backend con Node.js',
      descripcion: 'Oportunidad para estudiante apasionado por el backend. Trabajarás en el desarrollo de APIs RESTful, integración con bases de datos y servicios en la nube.',
      requisitos: '- Estudiante de 8vo ciclo en adelante\n- Conocimientos de Node.js y Express\n- SQL y PostgreSQL\n- Conocimientos básicos de Docker',
      conocimientos: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'],
      beneficios: '- Pago de S/ 1,500 mensuales\n- Mentorship con desarrolladores senior\n- Proyectos desafiantes\n- Evaluación de desempeño trimestral',
      fechaInicioPostulacion: new Date('2024-10-15'),
      fechaFinPostulacion: new Date('2024-11-30'),
      fechaInicioPractica: new Date('2024-12-02'),
      fechaFinPractica: new Date('2025-03-02'),
      cupos: 1,
      horasDiarias: 8,
      estado: OfertaEstado.PUBLICADA,
    },
    {
      empresaId: createdCompanies[1]?.id,
      titulo: 'Practicante en Análisis de Datos y Business Intelligence',
      descripcion: 'Buscamos estudiante con interés en ciencia de datos para apoyar en la creación de dashboards, reportes automatizados y análisis de métricas de negocio.',
      requisitos: '- Estudiante de Ingeniería de Sistemas o Estadística\n- Conocimientos de Python y SQL\n- Excel avanzado\n- Conocimientos de Power BI o Tableau (deseable)',
      conocimientos: ['Python', 'SQL', 'Power BI', 'Excel', 'Análisis de Datos'],
      beneficios: '- Pago de S/ 1,100 mensuales\n- Trabajo remoto 2 días a la semana\n- Capacitación en herramientas de BI\n- Carta de recomendación al concluir',
      fechaInicioPostulacion: new Date('2024-11-10'),
      fechaFinPostulacion: new Date('2024-12-20'),
      fechaInicioPractica: new Date('2025-01-13'),
      fechaFinPractica: new Date('2025-04-13'),
      cupos: 2,
      horasDiarias: 6,
      estado: OfertaEstado.PUBLICADA,
    },
  ];

  const createdOfertas: InternshipOffer[] = [];

  for (const ofertaData of ofertas) {
    if (!ofertaData.empresaId) continue;
    const offerExists = await offerRepo.findOneBy({ 
      empresaId: ofertaData.empresaId,
      titulo: ofertaData.titulo 
    });
    if (!offerExists) {
      const offer = offerRepo.create(ofertaData);
      await offerRepo.save(offer);
      createdOfertas.push(offer);
      console.log(`✓ Oferta creada: ${ofertaData.titulo}`);
    }
  }

  // ==================== POSTULACIÓN DE ESTUDIANTE ====================
  const estudiante = createdUsers[RolUsuario.ESTUDIANTE];
  const studentProfile = estudiante ? await studentRepo.findOneBy({ usuarioId: estudiante.id }) : null;

  if (studentProfile && createdOfertas.length > 0) {
    // Postulación a la primera oferta
    const existingApplication = await applicationRepo.findOneBy({
      estudianteId: studentProfile.id,
      ofertaId: createdOfertas[0].id,
    });

    if (!existingApplication) {
      const application = applicationRepo.create({
        estudianteId: studentProfile.id,
        ofertaId: createdOfertas[0].id,
        estado: ApplicationEstado.APROBADO,
        fechaPostulacion: new Date('2024-11-05'),
        cartaPresentacion: 'Estimados, me interesa mucho la oportunidad de practicar en desarrollo frontend. Tengo experiencia en proyectos personales con React y busco crecer profesionalmente.',
      });
      await applicationRepo.save(application);
      console.log(`✓ Postulación creada para estudiante`);

      // Crear práctica activa
      const existingInternship = await internshipRepo.findOneBy({
        postulacionId: application.id,
      });

      if (!existingInternship) {
        const internship = internshipRepo.create({
          postulacionId: application.id,
          estudianteId: studentProfile.id,
          empresaId: createdOfertas[0].empresaId,
          fechaInicio: new Date('2025-01-06'),
          fechaFin: new Date('2025-04-06'),
          horasCompletadas: 240,
          horasTotalesRequeridas: 320,
          estado: InternshipEstado.ACTIVA,
          asesorEmpresaNombre: 'Ing. Ana María Castro',
        });
        await internshipRepo.save(internship);
        console.log(`✓ Práctica en progreso creada para estudiante`);
      }
    }
  }

  // ==================== TESIS DE ESTUDIANTE ====================
  if (studentProfile) {
    const existingThesis = await thesisRepo.findOneBy({ estudianteId: studentProfile.id });
    if (!existingThesis) {
      const thesis = thesisRepo.create({
        estudianteId: studentProfile.id,
        titulo: 'Sistema de Gestión Integral de Prácticas Preprofesionales para la Universidad Nacional de Trujillo',
        resumen: 'Este trabajo de investigación propone el diseño e implementación de un sistema web integral para la gestión automatizada de prácticas preprofesionales en la UNT. El sistema permite el seguimiento completo del proceso: desde la publicación de ofertas por empresas, postulación de estudiantes, asignación de asesores, hasta la evaluación final. Se utilizaron tecnologías modernas como NestJS, React y PostgreSQL, aplicando metodologías ágiles.',
        areaConocimiento: 'Ingeniería de Software y Sistemas de Información',
        estado: ThesisEstado.EN_DESARROLLO,
        fechaRegistro: new Date('2024-08-15'),
      });
      await thesisRepo.save(thesis);
      console.log(`✓ Proyecto de tesis creado para estudiante`);
    }
  }

  console.log('\n✅ SEED COMPLETADO EXITOSAMENTE');
  console.log('\n=== DATOS DE PRUEBA ===');
  console.log('Usuarios:');
  testUsers.forEach(u => console.log(`  - ${u.email} / 123456 (${u.rol})`));
  console.log('\nEmpresas:');
  companies.forEach(c => console.log(`  - ${c.nombreComercial}`));
  console.log('\nEl estudiante tiene:');
  console.log('  - Perfil completo con datos académicos');
  console.log('  - Postulación a una práctica APROBADA');
  console.log('  - Práctica activa (240/320 horas)');
  console.log('  - Proyecto de tesis en desarrollo');
}