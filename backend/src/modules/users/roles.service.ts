import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role, RoleName } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    return this.roleRepository.find({ where: { activo: true } });
  }

  async findById(id: number): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id, activo: true } });
  }

  async findByName(nombre: RoleName): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { nombre, activo: true } });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return this.roleRepository.save(role);
  }

  async update(id: number, roleData: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, roleData);
    return this.findById(id);
  }

  async deactivate(id: number): Promise<void> {
    await this.roleRepository.update(id, { activo: false });
  }

  async initializeDefaultRoles(): Promise<void> {
    const defaultRoles = [
      { nombre: RoleName.ADMIN, descripcion: 'Acceso completo al sistema' },
      { nombre: RoleName.COORDINADOR, descripcion: 'Gestiona prácticas y tesis a nivel de facultad' },
      { nombre: RoleName.ASESOR, descripcion: 'Docente que asesora prácticas y tesis' },
      { nombre: RoleName.ESTUDIANTE, descripcion: 'Usuario que realiza prácticas y desarrolla tesis' },
      { nombre: RoleName.REPRESENTANTE_EMPRESA, descripcion: 'Representante de empresas colaboradoras' },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.findByName(roleData.nombre as RoleName);
      if (!existingRole) {
        await this.create(roleData);
      }
    }
  }
}
