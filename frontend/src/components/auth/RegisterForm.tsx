'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/react';

const registerSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').min(3, 'Nombre demasiado corto'),
  apellidoPaterno: z.string().min(1, 'El apellido paterno es requerido'),
  apellidoMaterno: z.string().min(1, 'El apellido materno es requerido'),
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  contrasena: z.string().min(1, 'La contraseña es requerida').min(6, 'Mínimo 6 caracteres'),
  confirmarContrasena: z.string().min(1, 'Confirma tu contraseña'),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
});

type RegisterInput = z.infer<typeof registerSchema>;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nombre: '', apellidoPaterno: '', apellidoMaterno: '', email: '', contrasena: '', confirmarContrasena: '' },
  });

  const contrasena = watch('contrasena');

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: any) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      router.push('/');
    },
    onError: (error: any) => {
      setRegisterError(error.message || 'Error al crear la cuenta');
    },
  });

  const onSubmit = (data: RegisterInput) => {
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
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-white lg:text-slate-900">Crear cuenta</h2>
        <p className="text-sm text-slate-400 lg:text-slate-500">
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
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-sm text-red-400">{registerError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nombre */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Label htmlFor="nombre" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
            <User className="w-4 h-4 text-slate-500" />
            Nombre
          </Label>
          <Input
            id="nombre"
            placeholder="Juan"
            className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.nombre ? 'border-red-500' : ''}`}
            {...register('nombre')}
          />
          {errors.nombre && <p className="text-xs text-red-400 mt-1">{errors.nombre.message}</p>}
        </motion.div>

        {/* Apellidos */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.05 }} className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="apellidoPaterno" className="text-sm font-medium text-slate-300 lg:text-slate-700 mb-1.5 block">Apellido Paterno</Label>
            <Input
              id="apellidoPaterno"
              placeholder="Pérez"
              className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.apellidoPaterno ? 'border-red-500' : ''}`}
              {...register('apellidoPaterno')}
            />
            {errors.apellidoPaterno && <p className="text-xs text-red-400 mt-1">{errors.apellidoPaterno.message}</p>}
          </div>
          <div>
            <Label htmlFor="apellidoMaterno" className="text-sm font-medium text-slate-300 lg:text-slate-700 mb-1.5 block">Apellido Materno</Label>
            <Input
              id="apellidoMaterno"
              placeholder="García"
              className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.apellidoMaterno ? 'border-red-500' : ''}`}
              {...register('apellidoMaterno')}
            />
            {errors.apellidoMaterno && <p className="text-xs text-red-400 mt-1">{errors.apellidoMaterno.message}</p>}
          </div>
        </motion.div>

        {/* Email */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Label htmlFor="email" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
            <Mail className="w-4 h-4 text-slate-500" />
            Correo Institucional
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="estudiante@unt.edu.pe"
            className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.email ? 'border-red-500' : ''}`}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </motion.div>

        {/* Contraseña */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.15 }}>
          <Label htmlFor="contrasena" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
            <Lock className="w-4 h-4 text-slate-500" />
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg pr-10 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.contrasena ? 'border-red-500' : ''}`}
              {...register('contrasena')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 lg:hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.contrasena && <p className="text-xs text-red-400 mt-1">{errors.contrasena.message}</p>}
        </motion.div>

        {/* Confirmar Contraseña */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Label htmlFor="confirmarContrasena" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
            <Lock className="w-4 h-4 text-slate-500" />
            Confirmar Contraseña
          </Label>
          <div className="relative">
            <Input
              id="confirmarContrasena"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg pr-10 focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.confirmarContrasena ? 'border-red-500' : ''}`}
              {...register('confirmarContrasena')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400 lg:hover:text-slate-600 transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmarContrasena && <p className="text-xs text-red-400 mt-1">{errors.confirmarContrasena.message}</p>}
        </motion.div>

        {/* Submit */}
        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.25 }} className="pt-2">
          <Button
            type="submit"
            loading={registerMutation.isLoading}
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 lg:bg-emerald-600 lg:hover:bg-emerald-500 text-slate-950 lg:text-white font-semibold rounded-lg transition-colors"
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
        <p className="text-center text-sm text-slate-400 lg:text-slate-600 pt-2">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-emerald-400 lg:text-emerald-600 hover:text-emerald-300 lg:hover:text-emerald-700 font-semibold transition-colors">
            Iniciar Sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
