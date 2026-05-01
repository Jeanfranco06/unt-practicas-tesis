import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('EMAIL_HOST') || 'smtp.gmail.com',
      port: this.configService.get('EMAIL_PORT') || 587,
      secure: false,
      auth: {
        user: this.configService.get('EMAIL_USER'),
        pass: this.configService.get('EMAIL_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions = {
      from: this.configService.get('EMAIL_USER'),
      to: email,
      subject: 'Restablecimiento de Contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Restablecimiento de Contraseña</h2>
          <p style="color: #666; line-height: 1.6;">
            Hemos recibido una solicitud para restablecer tu contraseña. 
            Si no solicitaste este cambio, puedes ignorar este correo.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Para restablecer tu contraseña, haz clic en el siguiente enlace:
          </p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
            Restablecer Contraseña
          </a>
          <p style="color: #666; line-height: 1.6;">
            Este enlace expirará en 30 minutos.
          </p>
          <p style="color: #999; font-size: 12px;">
            Si no solicitaste este cambio, por favor ignora este correo.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Correo enviado a ${email}`);
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw error;
    }
  }
}
