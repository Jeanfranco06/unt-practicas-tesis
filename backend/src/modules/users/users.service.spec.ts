import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role, RoleName } from './entities/role.entity';
import { Student } from '../students/entities/student.entity';
import { Company } from '../companies/entities/company.entity';
import { Teacher } from '../academic/entities/teacher.entity';
import { CompanyRepresentative } from '../companies/entities/company-representative.entity';
import { Career } from '../academic/entities/career.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: jest.Mocked<Repository<User>>;
  let roleRepo: jest.Mocked<Repository<Role>>;
  let studentRepo: jest.Mocked<Repository<Student>>;
  let teacherRepo: jest.Mocked<Repository<Teacher>>;
  let careerRepo: jest.Mocked<Repository<Career>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            query: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              select: jest.fn().mockReturnThis(),
              getMany: jest.fn(),
            })),
          },
        },
        {
          provide: getRepositoryToken(Role),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Career),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Company),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(CompanyRepresentative),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
    studentRepo = module.get(getRepositoryToken(Student));
    teacherRepo = module.get(getRepositoryToken(Teacher));
    careerRepo = module.get(getRepositoryToken(Career));
  });

  describe('assignPrimaryRole', () => {
    it('should return null when no roles provided', () => {
      const result = (service as any).assignPrimaryRole([]);
      expect(result).toBeNull();
    });

    it('should prioritize ADMIN over other roles', () => {
      const roles: Role[] = [
        { id: 1, nombre: RoleName.ESTUDIANTE, descripcion: '', activo: true },
        { id: 2, nombre: RoleName.ADMIN, descripcion: '', activo: true },
      ];
      const result = (service as any).assignPrimaryRole(roles);
      expect(result).toBe('ADMIN');
    });

    it('should prioritize ASESOR over COORDINADOR', () => {
      const roles: Role[] = [
        { id: 1, nombre: RoleName.COORDINADOR, descripcion: '', activo: true },
        { id: 2, nombre: RoleName.ASESOR, descripcion: '', activo: true },
      ];
      const result = (service as any).assignPrimaryRole(roles);
      expect(result).toBe('ASESOR');
    });

    it('should return first role when only one role', () => {
      const roles: Role[] = [
        { id: 1, nombre: RoleName.ESTUDIANTE, descripcion: '', activo: true },
      ];
      const result = (service as any).assignPrimaryRole(roles);
      expect(result).toBe('ESTUDIANTE');
    });

    it('should prioritize correct order: ADMIN > ASESOR > COORDINADOR > ESTUDIANTE > REPRESENTANTE_EMPRESA', () => {
      const roles: Role[] = [
        { id: 1, nombre: RoleName.REPRESENTANTE_EMPRESA, descripcion: '', activo: true },
        { id: 2, nombre: RoleName.ESTUDIANTE, descripcion: '', activo: true },
        { id: 3, nombre: RoleName.COORDINADOR, descripcion: '', activo: true },
        { id: 4, nombre: RoleName.ASESOR, descripcion: '', activo: true },
        { id: 5, nombre: RoleName.ADMIN, descripcion: '', activo: true },
      ];
      const result = (service as any).assignPrimaryRole(roles);
      expect(result).toBe('ADMIN');
    });
  });

  describe('generateCodigoUniversitario', () => {
    const mockCareer: Career = {
      id: 1,
      nombre: 'Ingeniería de Sistemas',
      facultadId: 1,
      codigo: 'IS',
      activo: true,
    } as Career;

    it('should generate unique code when no conflicts', async () => {
      studentRepo.findOne.mockResolvedValue(null);
      
      const result = await (service as any).generateCodigoUniversitario(mockCareer, 2024);
      
      expect(result).toMatch(/^2024ING\d{4}$/);
      expect(studentRepo.findOne).toHaveBeenCalled();
    });

    it('should retry when code already exists', async () => {
      // First call finds existing, second call finds nothing (unique)
      studentRepo.findOne
        .mockResolvedValueOnce({ id: 1 } as Student)
        .mockResolvedValueOnce(null);
      
      const result = await (service as any).generateCodigoUniversitario(mockCareer, 2024);
      
      expect(result).toMatch(/^2024ING\d{4}$/);
      expect(studentRepo.findOne).toHaveBeenCalledTimes(2);
    });

    it('should use timestamp fallback after max attempts', async () => {
      // Always return existing student (simulate all random codes taken)
      studentRepo.findOne.mockResolvedValue({ id: 1 } as Student);
      
      const result = await (service as any).generateCodigoUniversitario(mockCareer, 2024);
      
      // Should fall back to timestamp-based code
      expect(result).toMatch(/^2024ING\d{4}$/);
      expect(studentRepo.findOne).toHaveBeenCalledTimes(10);
    });

    it('should generate code with correct format', async () => {
      studentRepo.findOne.mockResolvedValue(null);
      
      const result = await (service as any).generateCodigoUniversitario(mockCareer, 2024);
      
      // Format: YYYY + first 3 letters of career name + 4 random digits
      expect(result).toHaveLength(11); // 4 (year) + 3 (career code) + 4 (random)
      expect(result.startsWith('2024')).toBe(true);
    });
  });

  describe('updateRefreshToken', () => {
    it('should update refresh token and expiration', async () => {
      const userId = 1;
      const refreshToken = 'test-refresh-token';
      
      await service.updateRefreshToken(userId, refreshToken);
      
      expect(userRepo.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          refreshToken,
          refreshTokenExpira: expect.any(Date),
        })
      );
    });

    it('should clear refresh token when null provided', async () => {
      const userId = 1;
      
      await service.updateRefreshToken(userId, null);
      
      expect(userRepo.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          refreshToken: null,
          refreshTokenExpira: null,
        })
      );
    });
  });

  describe('getRefreshToken', () => {
    it('should return stored refresh token', async () => {
      const mockUser = { refreshToken: 'stored-token' } as User;
      userRepo.findOne.mockResolvedValue(mockUser);
      
      const result = await service.getRefreshToken(1);
      
      expect(result).toBe('stored-token');
    });

    it('should return null when no token stored', async () => {
      userRepo.findOne.mockResolvedValue({ refreshToken: null } as User);
      
      const result = await service.getRefreshToken(1);
      
      expect(result).toBeNull();
    });
  });

  describe('isRefreshTokenValid', () => {
    it('should return true for valid non-expired token', async () => {
      const mockUser = {
        refreshToken: 'valid-token',
        refreshTokenExpira: new Date(Date.now() + 86400000), // 1 day from now
      } as User;
      
      userRepo.findOne
        .mockResolvedValueOnce({ refreshToken: 'valid-token' } as User)
        .mockResolvedValueOnce(mockUser);
      
      const result = await service.isRefreshTokenValid(1, 'valid-token');
      
      expect(result).toBe(true);
    });

    it('should return false when token does not match', async () => {
      userRepo.findOne.mockResolvedValue({ refreshToken: 'different-token' } as User);
      
      const result = await service.isRefreshTokenValid(1, 'provided-token');
      
      expect(result).toBe(false);
    });

    it('should return false when token is expired', async () => {
      const mockUser = {
        refreshToken: 'expired-token',
        refreshTokenExpira: new Date(Date.now() - 86400000), // 1 day ago
      } as User;
      
      userRepo.findOne
        .mockResolvedValueOnce({ refreshToken: 'expired-token' } as User)
        .mockResolvedValueOnce(mockUser);
      
      const result = await service.isRefreshTokenValid(1, 'expired-token');
      
      expect(result).toBe(false);
    });
  });
});
