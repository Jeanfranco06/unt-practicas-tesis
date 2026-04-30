import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido')
    .regex(/^[a-zA-Z0-9._%+-]+@(unt\.edu\.pe|gmail\.com)$/, 'Usa tu correo institucional (@unt.edu.pe)'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string()
    .min(1, 'El nombre completo es requerido')
    .min(3, 'Nombre demasiado corto')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Solo letras y espacios'),
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido')
    .regex(/^[a-zA-Z0-9._%+-]+@unt\.edu\.pe$/, 'Debe ser un correo institucional @unt.edu.pe'),
  password: z.string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'Mínimo 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Debe tener mayúscula, minúscula y número'),
  confirmPassword: z.string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido')
    .regex(/@unt\.edu\.pe$/, 'Usa tu correo institucional'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;