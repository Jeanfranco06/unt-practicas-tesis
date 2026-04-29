import { DataSource } from 'typeorm';
import { User, RolUsuario } from '../modules/users/entities/user.entity';
import { Student } from '../modules/students/entities/student.entity';
import { Company } from '../modules/companies/entities/company.entity';
import { InternshipOffer, OfertaEstado } from '../modules/internships/entities/internship-offer.entity';
import * as bcrypt from 'bcrypt';

export async function seed(db: DataSource) {
  const userRepo = db.getRepository(User);
  const studentRepo = db.getRepository(Student);
  const companyRepo = db.getRepository(Company);
  const offerRepo = db.getRepository(InternshipOffer);

  // Estudiante de prueba
  const hashedPassword = await bcrypt.hash('123456', 10);
  let user = await userRepo.findOneBy({ email: 'estudiante@unt.edu.pe' });
  if (!user) {
    user = userRepo.create({
      email: 'estudiante@unt.edu.pe',
      contrasenaHash: hashedPassword,
      nombre: 'Juan',
      apellidoPaterno: 'Perez',
      apellidoMaterno: 'Lopez',
      rol: RolUsuario.ESTUDIANTE,
      activo: true,
    });
    await userRepo.save(user);
  }

  let student = await studentRepo.findOneBy({ usuarioId: user.id });
  if (!student) {
    student = studentRepo.create({
      usuarioId: user.id,
      codigoUniversitario: '20240001',
      anioIngreso: 2024,
      escuelaProfesional: 'Ingeniería de Sistemas',
      creditosAprobados: 120,
    });
    await studentRepo.save(student);
  }

  // Empresa de prueba
  let company = await companyRepo.findOneBy({ ruc: '12345678901' });
  if (!company) {
    company = companyRepo.create({
      ruc: '12345678901',
      razonSocial: 'Empresa Test SAC',
      nombreComercial: 'TestCorp',
    });
    await companyRepo.save(company);
  }

  // Oferta de práctica
  const offerExists = await offerRepo.findOneBy({ empresaId: company.id });
  if (!offerExists) {
    const offer = offerRepo.create({
      empresaId: company.id,
      titulo: 'Práctica en Desarrollo Web',
      requisitos: 'Conocimientos en React, Node.js',
      fechaInicioPostulacion: new Date('2025-01-01'),
      fechaFinPostulacion: new Date('2025-12-31'),
      fechaInicioPractica: new Date('2025-02-01'),
      fechaFinPractica: new Date('2025-05-31'),
      cupos: 3,
      estado: OfertaEstado.PUBLICADA,
    });
    await offerRepo.save(offer);
  }
}