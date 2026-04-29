import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@unt.edu.pe',
    contrasenaHash: 'hashed',
    nombre: 'Test',
    apellidoPaterno: 'User',
    apellidoMaterno: 'Test',
    rol: 'Estudiante',
    activo: true,
    refreshToken: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            updateRefreshToken: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('fake-token'),
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('login', () => {
    it('debería retornar tokens cuando las credenciales son válidas', async () => {
      const loginDto = { email: 'test@unt.edu.pe', contrasena: '123456' };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
      jest.spyOn(usersService, 'updateRefreshToken').mockResolvedValue();

      const result = await service.login(loginDto);
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(mockUser.id, 'rt');
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      await expect(service.login({ email: 'x@x.com', contrasena: '123' })).rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si la contraseña no coincide', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login({ email: 'test@unt.edu.pe', contrasena: 'wrong' })).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('debería registrar un nuevo usuario y retornar tokens', async () => {
      const registerDto = {
        email: 'new@unt.edu.pe',
        contrasena: '123456',
        nombre: 'New',
        apellidoPaterno: 'User',
        apellidoMaterno: 'Test',
        rol: 'Estudiante',
      };
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      jest.spyOn(usersService, 'create').mockResolvedValue({ ...mockUser, id: 2, email: registerDto.email });
      jest.spyOn(service as any, 'generateTokens').mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
      jest.spyOn(usersService, 'updateRefreshToken').mockResolvedValue();

      const result = await service.register(registerDto);
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining({ email: registerDto.email }));
    });

    it('debería lanzar ConflictException si el email ya existe', async () => {
      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser);
      await expect(service.register({} as any)).rejects.toThrow(ConflictException);
    });
  });
});