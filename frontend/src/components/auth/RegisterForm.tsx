'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Check, X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/react';

const registerSchema = z.object({
  nombre: z.string()
    .min(1, 'El nombre es requerido')
    .min(3, 'Nombre demasiado corto'),
  apellidoPaterno: z.string()
    .min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string()
    .min(1, 'El apellido materno es requerido'),
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
  contrasena: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres'),
  confirmarContrasena: z.string()
    .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
});

type RegisterInput = z.infer<typeof registerSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      email: '',
      contrasena: '',
      confirmarContrasena: '',
    },
  });

  const contrasena = watch('contrasena');

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      router.push('/');
    },
    onError: (error) => {
      setRegisterError(error.message || 'Error al crear la cuenta');
    },
  });

  const checkPasswordStrength = (pass: string) => {
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) strength++;
    if (pass.match(/\d/)) strength++;
    if (pass.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const strength = checkPasswordStrength(contrasena || '');

  const strengthConfig = [
    { color: 'bg-slate-200', label: 'Muy débil' },
    { color: 'bg-red-500', label: 'Débil' },
    { color: 'bg-yellow-500', label: 'Media' },
    { color: 'bg-green-500', label: 'Fuerte' },
    { color: 'bg-emerald-500', label: 'Muy fuerte' },
  ];

  const onSubmit = async (data: RegisterInput) => {
    setRegisterError(null);
    registerMutation.mutate({
      email: data.email,
      contrasena: data.contrasena,
      nombre: data.nombre,
      apellidoPaterno: data.apellidoPaterno,
      apellidoMaterno: data.apellidoMaterno,
      rol: 'Estudiante',
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-glow mb-2"
        >
          <UserPlus className="w-7 h-7 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Crear cuenta</h2>
        <p className="text-slate-500 text-sm">
          Únete al sistema de prácticas de la UNT
        </p>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {registerError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-50 border border-red-100 rounded-xl"
          >
            <p className="text-sm text-red-600">{registerError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="nombre" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Nombre
          </Label>
          <Input
            id="nombre"
            placeholder="Juan"
            className={`h-11 bg-slate-50 border-slate-200 rounded-xl ${errors.nombre ? 'border-red-300' : ''}`}
            {...register('nombre')}
          />
          {errors.nombre && <p className="text-xs text-red-500">{errors.nombre.message}</p>}
        </motion.div>

        {/* Apellidos */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="apellidoPaterno" className="text-sm font-medium text-slate-700">Apellido Paterno</Label>
            <Input
              id="apellidoPaterno"
              placeholder="Pérez"
              className={`h-11 bg-slate-50 border-slate-200 rounded-xl ${errors.apellidoPaterno ? 'border-red-300' : ''}`}
              {...register('apellidoPaterno')}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="apellidoMaterno" className="text-sm font-medium text-slate-700">Apellido Materno</Label>
            <Input
              id="apellidoMaterno"
              placeholder="García"
              className={`h-11 bg-slate-50 border-slate-200 rounded-xl ${errors.apellidoMaterno ? 'border-red-300' : ''}`}
              {...register('apellidoMaterno')}
            />
          </div>
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            Correo Institucional
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="estudiante@unt.edu.pe"
            className={`h-11 bg-slate-50 border-slate-200 rounded-xl ${errors.email ? 'border-red-300' : ''}`}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        </motion.div>

        {/* Contraseña */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="contrasena" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-11 bg-slate-50 border-slate-200 rounded-xl pr-11 ${errors.contrasena ? 'border-red-300' : ''}`}
              {...register('contrasena')}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
          </div>
          
          {/* Password Strength */}
          {contrasena && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-1.5 pt-1"
            >
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <motion.div
                    key={level}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: strength >= level ? 1 : 0.3 }}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      strength >= level ? strengthConfig[strength].color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className={`text-xs font-medium ${
                strength <= 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {strengthConfig[strength].label}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Confirmar Contraseña */}
        <motion.div variants={itemVariants} className="space-y-1.5">
          <Label htmlFor="confirmarContrasena" className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            Confirmar Contraseña
          </Label>
          <div className="relative">
            <Input
              id="confirmarContrasena"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-11 bg-slate-50 border-slate-200 rounded-xl pr-11 ${errors.confirmarContrasena ? 'border-red-300' : ''}`}
              {...register('confirmarContrasena')}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
          </div>
          {errors.confirmarContrasena && (
            <p className="text-xs text-red-500">{errors.confirmarContrasena.message}</p>
          )}
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            type="submit"
            loading={registerMutation.isLoading}
            className="w-full h-11 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25"
          >
            <span className="flex items-center gap-2">
              {registerMutation.isLoading ? 'Creando cuenta...' : (
                <>
                  Crear Cuenta
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </span>
          </Button>
        </motion.div>

        {/* Login Link */}
        <motion.div variants={itemVariants} className="text-center pt-2">
          <p className="text-sm text-slate-600">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}