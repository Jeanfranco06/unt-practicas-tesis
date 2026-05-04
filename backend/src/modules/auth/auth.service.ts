import { Injectable, UnauthorizedException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { CompanyRepresentativeService } from '../companies/services/company-representative.service';
// import { RolesService } from '../users/roles.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { RoleName } from '../users/entities/role.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @Inject(forwardRef(() => CompanyRepresentativeService))
    private companyRepresentativeService: CompanyRepresentativeService,
    // private rolesService: RolesService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.contrasena, user.contrasenaHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.activo) throw new UnauthorizedException('Usuario inactivo');

    // Obtener roles reales del usuario desde la base de datos
    const userRoles = await this.usersService.getUserRoles(user.id);
    if (userRoles.length === 0) {
      throw new UnauthorizedException('Usuario sin roles asignados. Contacte al administrador.');
    }
    const roles = userRoles.map(role => role.nombre);
    const tokens = await this.generateTokens(user.id, user.email, roles as RoleName[]);
    // Almacenar refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);

    // Si es RepresentanteEmpresa, incluir empresaId en la respuesta
    let empresaId: number | null = null;
    if (roles.includes(RoleName.REPRESENTANTE_EMPRESA)) {
      try {
        const rep = await this.companyRepresentativeService.findByUser(user.id);
        if (rep) empresaId = rep.empresaId;
      } catch {
        // No fallar el login si no se encuentra el representante
      }
    }

    return { ...tokens, empresaId };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('El email ya está registrado');
    
    const hashedPassword = await bcrypt.hash(registerDto.contrasena, 10);
    
    // Create user without roles first
    const user = await this.usersService.create({
      email: registerDto.email,
      contrasenaHash: hashedPassword,
      nombre: registerDto.nombre,
      apellidoPaterno: registerDto.apellidoPaterno,
      apellidoMaterno: registerDto.apellidoMaterno,
      activo: true,
    } as any);

    // Assign the specified role
    // const role = await this.rolesService.findByName(registerDto.rol as RoleName);
    // if (!role) {
    //   throw new ConflictException('Rol no válido');
    // }
    
    // await this.usersService.assignRole(user.id, role.id);
    
    // Reload user with roles
    // const userWithRoles = await this.usersService.findByIdWithRoles(user.id);
    // const roles = userWithRoles.roles.map(role => role.nombre);
    
    const tokens = await this.generateTokens(user.id, user.email, ['Estudiante' as RoleName]);
    // Almacenar refresh token
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get('JWT_REFRESH_SECRET') });
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new UnauthorizedException('Usuario no encontrado');
      
      // Validar que el refresh token coincida con el almacenado
      const storedToken = await this.usersService.getRefreshToken(user.id);
      if (!storedToken || storedToken !== refreshToken) {
        throw new UnauthorizedException('Refresh token inválido o revocado');
      }

      // Mantener roles reales (igual que login)
      const userRoles = await this.usersService.getUserRoles(user.id);
      const roles = userRoles.length > 0 ? userRoles.map(role => role.nombre) : ['Estudiante' as RoleName];

      const tokens = await this.generateTokens(user.id, user.email, roles as RoleName[]);
      // Almacenar refresh token
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token expirado o inválido');
    }
  }

  async logout(userId: number) {
    // Invalidar refresh token al cerrar sesión
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(userId: number, email: string, roles: RoleName[]) {
    const payload = { sub: userId, email, roles };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  async hasRole(userId: number, role: RoleName): Promise<boolean> {
    const roles = await this.usersService.getUserRoles(userId);
    return roles.some(userRole => userRole.nombre === role);
  }

  async hasAnyRole(userId: number, roles: RoleName[]): Promise<boolean> {
    const userRoles = await this.usersService.getUserRoles(userId);
    const userRoleNames = userRoles.map(userRole => userRole.nombre);
    return roles.some(role => userRoleNames.includes(role));
  }
}
