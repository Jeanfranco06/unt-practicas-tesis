import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { CreateStudentDto, UpdateStudentDto } from './dto/student.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student) private studentRepo: Repository<Student>,
    private usersService: UsersService,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentRepo.find({ relations: ['usuario'] });
  }

  async findById(id: number): Promise<Student> {
    const student = await this.studentRepo.findOne({ where: { id }, relations: ['usuario'] });
    if (!student) throw new NotFoundException('Estudiante no encontrado');
    return student;
  }

  async findByUsuarioId(usuarioId: number): Promise<Student | null> {
    return this.studentRepo.findOne({ where: { usuarioId }, relations: ['usuario'] });
  }

  async create(createDto: CreateStudentDto): Promise<Student> {
    await this.usersService.findById(createDto.usuarioId); // verificar existencia
    const student = this.studentRepo.create(createDto);
    return this.studentRepo.save(student);
  }

  async update(id: number, updateDto: UpdateStudentDto): Promise<Student> {
    await this.studentRepo.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: number): Promise<void> {
    await this.studentRepo.delete(id);
  }
}