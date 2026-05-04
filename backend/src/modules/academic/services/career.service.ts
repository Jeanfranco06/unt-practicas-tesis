import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Career } from '../entities/career.entity';
import { Faculty } from '../entities/faculty.entity';
// import { CreateCareerDto, UpdateCareerDto } from '../dto/career.dto';

@Injectable()
export class CareerService {
  constructor(
    @InjectRepository(Career)
    private readonly careerRepository: Repository<Career>,
  ) {}

  async findAll(): Promise<Career[]> {
    return this.careerRepository.find({ 
      where: { activo: true },
      relations: ['estudiantes']
    });
  }

  async findById(id: number): Promise<Career> {
    const career = await this.careerRepository.findOne({ 
      where: { id, activo: true },
      relations: ['estudiantes']
    });
    if (!career) throw new NotFoundException('Carrera no encontrada');
    return career;
  }

  async findByFaculty(facultadId: number): Promise<Career[]> {
    return this.careerRepository.find({ 
      where: { facultadId, activo: true }
    });
  }

  async create(createCareerDto: any): Promise<Career> {
    const career = this.careerRepository.create(createCareerDto as Partial<Career>);
    return this.careerRepository.save(career as Career);
  }

  async update(id: number, updateCareerDto: any): Promise<Career> {
    await this.careerRepository.update(id, updateCareerDto);
    const updated = await this.findById(id);
    if (!updated) {
      throw new NotFoundException('Carrera no encontrada después de actualizar');
    }
    return updated;
  }

  async deactivate(id: number): Promise<void> {
    await this.careerRepository.update(id, { activo: false });
  }

  async findByCode(codigo: string): Promise<Career | null> {
    return this.careerRepository.findOne({ 
      where: { codigo, activo: true }
    });
  }

  async findFirst(): Promise<Career | null> {
    return this.careerRepository.findOne({ 
      where: { activo: true },
      order: { id: 'ASC' }
    });
  }
}
