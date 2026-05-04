import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from '../entities/teacher.entity';
// import { CreateTeacherDto, UpdateTeacherDto } from '../dto/teacher.dto';

@Injectable()
export class TeacherService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async findAll(): Promise<Teacher[]> {
    return this.teacherRepository.find({ 
      relations: ['usuario', 'carrera']
    });
  }

  async findById(id: number): Promise<Teacher> {
    const teacher = await this.teacherRepository.findOne({ 
      where: { id },
      relations: ['usuario', 'carrera']
    });
    if (!teacher) throw new NotFoundException('Docente no encontrado');
    return teacher;
  }

  async findByCareer(carreraId: number): Promise<Teacher[]> {
    return this.teacherRepository.find({ 
      where: { carreraId },
      relations: ['usuario', 'carrera']
    });
  }

  async findByUser(usuarioId: number): Promise<Teacher | null> {
    return this.teacherRepository.findOne({ 
      where: { usuarioId },
      relations: ['usuario', 'carrera']
    });
  }

  async create(createTeacherDto: any): Promise<Teacher> {
    const teacher = this.teacherRepository.create(createTeacherDto as Partial<Teacher>);
    return this.teacherRepository.save(teacher as Teacher);
  }

  async update(id: number, updateTeacherDto: any): Promise<Teacher> {
    await this.teacherRepository.update(id, updateTeacherDto);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Docente no encontrado después de actualizar');
    }
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.teacherRepository.delete(id);
  }

  async findBySpecialty(especialidad: string): Promise<Teacher[]> {
    return this.teacherRepository.find({ 
      where: { especialidad }
    });
  }
}
