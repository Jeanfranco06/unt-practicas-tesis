import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faculty } from '../entities/faculty.entity';
// DTO imports will be fixed when DTO files are properly created
// import { CreateFacultyDto, UpdateFacultyDto } from '../dto/faculty.dto';

@Injectable()
export class FacultyService {
  constructor(
    @InjectRepository(Faculty)
    private readonly facultyRepository: Repository<Faculty>,
  ) {}

  async findAll(): Promise<Faculty[]> {
    return this.facultyRepository.find({ 
      where: { activo: true },
      relations: ['carreras']
    });
  }

  async findById(id: number): Promise<Faculty> {
    const faculty = await this.facultyRepository.findOne({ 
      where: { id, activo: true },
      relations: ['carreras']
    });
    if (!faculty) throw new NotFoundException('Facultad no encontrada');
    return faculty;
  }

  async create(createFacultyDto: any): Promise<Faculty> {
    const faculty = this.facultyRepository.create(createFacultyDto as Partial<Faculty>);
    return this.facultyRepository.save(faculty as Faculty);
  }

  async update(id: number, updateFacultyDto: any): Promise<Faculty> {
    await this.facultyRepository.update(id, updateFacultyDto);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Facultad no encontrada después de actualizar');
    }
    return updated;
  }

  async deactivate(id: number): Promise<void> {
    await this.facultyRepository.update(id, { activo: false });
  }

  async findByCode(codigo: string): Promise<Faculty | null> {
    return this.facultyRepository.findOne({ 
      where: { codigo, activo: true } 
    });
  }
}
