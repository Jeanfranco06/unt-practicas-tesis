import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.contrasena, user.contrasenaHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.activo) throw new UnauthorizedException('Usuario inactivo');
    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('El email ya está registrado');
    const hashedPassword = await bcrypt.hash(registerDto.contrasena, 10);
    const user = await this.usersService.create({
      email: registerDto.email,
      contrasenaHash: hashedPassword,
      nombre: registerDto.nombre,
      apellidoPaterno: registerDto.apellidoPaterno,
      apellidoMaterno: registerDto.apellidoMaterno,
      rol: registerDto.rol as RolUsuario,
      activo: true,
    });
    const tokens = await this.generateTokens(user.id, user.email, user.rol);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedException('Refresh token inválido');
      const tokens = await this.generateTokens(user.id, user.email, user.rol);
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token expirado o inválido');
    }
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(userId: number, email: string, rol: RolUsuario) {
    const payload = { sub: userId, email, rol };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { secret: process.env.JWT_REFRESH_SECRET, expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }),
    ]);
    return { accessToken, refreshToken };
  }
}