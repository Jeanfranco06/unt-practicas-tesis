import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { RolUsuario } from '../users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { randomBytes } from 'crypto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepository: Repository<PasswordResetToken>,
    private mailService: MailService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.contrasena, user.contrasenaHash))) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    if (!user.activo) throw new UnauthorizedException('Usuario inactivo');
    const tokens = await this.generateTokens(user.id, user.email, user.rol, user.activo);
    await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email);
    if (existing) throw new ConflictException('El email ya está registrado');
    const hashedPassword = await bcrypt.hash(registerDto.contrasena, 10);
    
    // Estudiantes se activan inmediatamente, asesores requieren aprobación
    const isActive = registerDto.rol === RolUsuario.ESTUDIANTE;
    
    const user = await this.usersService.create({
      email: registerDto.email,
      contrasenaHash: hashedPassword,
      nombre: registerDto.nombre,
      apellidoPaterno: registerDto.apellidoPaterno,
      apellidoMaterno: registerDto.apellidoMaterno,
      rol: registerDto.rol as RolUsuario,
      activo: isActive,
    });
    
    // No generar tokens en el registro, el usuario debe iniciar sesión manualmente
    if (isActive) {
      return { 
        requiresApproval: false,
        message: 'Cuenta creada correctamente. Por favor, inicie sesión.'
      };
    }
    
    // Para asesores, retornar mensaje de que requiere aprobación
    return { 
      requiresApproval: true, 
      message: 'Tu solicitud ha sido enviada y está en revisión. Se te notificará cuando sea aprobada.'
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;
    try {
      const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get('JWT_REFRESH_SECRET') });
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedException('Refresh token inválido');
      const tokens = await this.generateTokens(user.id, user.email, user.rol, user.activo);
      await this.usersService.updateRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw new UnauthorizedException('Refresh token expirado o inválido');
    }
  }

  async logout(userId: number) {
    await this.usersService.updateRefreshToken(userId, null);
  }

  private async generateTokens(userId: number, email: string, rol: RolUsuario, activo: boolean) {
    const payload = { sub: userId, email, rol, activo };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, { secret: this.configService.get('JWT_REFRESH_SECRET'), expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(forgotPasswordDto.email);
    
    // Si el usuario no existe, retornar mensaje genérico para evitar enumeración
    if (!user) {
      return { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };
    }

    // Generar token único
    const token = randomBytes(32).toString('hex');
    const expiraEn = new Date();
    expiraEn.setMinutes(expiraEn.getMinutes() + 30); // Expira en 30 minutos

    // Invalidar tokens anteriores del usuario
    await this.passwordResetTokenRepository.update(
      { usuarioId: user.id },
      { usado: true }
    );

    // Guardar nuevo token
    const resetToken = this.passwordResetTokenRepository.create({
      token,
      usuarioId: user.id,
      expiraEn,
      usado: false,
    });
    await this.passwordResetTokenRepository.save(resetToken);

    // Enviar correo real
    try {
      await this.mailService.sendPasswordResetEmail(user.email, token);
    } catch (error) {
      console.error('Error al enviar correo de recuperación:', error);
      // Si falla el envío, mostrar el token en consola como fallback
      console.log('=== TOKEN DE RECUPERACIÓN DE CONTRASEÑA (FALLBACK) ===');
      console.log(`Para el usuario: ${user.email}`);
      console.log(`Token: ${token}`);
      console.log(`Expira en: ${expiraEn}`);
      console.log(`Enlace de recuperación: ${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`);
      console.log('========================================================');
    }

    return { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, contrasena } = resetPasswordDto;

    // Buscar token válido
    const resetToken = await this.passwordResetTokenRepository.findOne({
      where: { token },
      relations: ['usuario'],
    });

    if (!resetToken) {
      throw new BadRequestException('Token inválido');
    }

    if (resetToken.usado) {
      throw new BadRequestException('Este token ya fue utilizado');
    }

    if (new Date() > resetToken.expiraEn) {
      throw new BadRequestException('Token expirado');
    }

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    await this.usersService.update(resetToken.usuarioId, {
      contrasenaHash: hashedPassword,
    });

    // Invalidar token
    resetToken.usado = true;
    await this.passwordResetTokenRepository.save(resetToken);

    return { message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.' };
  }
}