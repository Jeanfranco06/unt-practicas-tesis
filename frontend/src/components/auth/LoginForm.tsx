'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/react';
import { getUserRole, getDashboardRouteByRole } from '@/lib/jwt';

const loginSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
  contrasena: z.string().min(1, 'La contraseña es requerida').min(6, 'Mínimo 6 caracteres'),
});

type LoginInput = z.infer<typeof loginSchema>;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', contrasena: '' },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      if (data.empresaId) {
        localStorage.setItem('empresaId', data.empresaId.toString());
      }
      const role = getUserRole(data.accessToken);
      const dashboardRoute = getDashboardRouteByRole(role);
      router.push(dashboardRoute);
    },
    onError: (error: any) => {
      setLoginError(error.message || 'Credenciales inválidas');
    },
  });

  const onSubmit = (data: LoginInput) => {
    setLoginError(null);
    loginMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center space-y-2"
      >
        <h2 className="text-2xl font-bold text-white lg:text-slate-900">Iniciar sesión</h2>
        <p className="text-sm text-slate-400 lg:text-slate-500">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <p className="text-sm text-red-400">{loginError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div variants={itemVariants} initial="hidden" animate="visible">
          <Label htmlFor="email" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
            <Mail className="w-4 h-4 text-slate-500" />
            Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@universidad.edu"
            className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.email ? 'border-red-500' : ''}`}
            {...register('email')}
          />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </motion.div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400 lg:text-slate-600 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-slate-600 lg:border-slate-300 bg-slate-800 lg:bg-white text-emerald-500 focus:ring-emerald-500/20" />
            <span>Recordarme</span>
          </label>
          <Link href="/forgot-password" className="text-emerald-400 lg:text-emerald-600 hover:text-emerald-300 lg:hover:text-emerald-700 transition-colors font-medium">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
          <Button
            type="submit"
            loading={loginMutation.isLoading}
            className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 lg:bg-emerald-600 lg:hover:bg-emerald-500 text-slate-950 lg:text-white font-semibold rounded-lg transition-colors"
          >
            <span className="flex items-center gap-2">
              {loginMutation.isLoading ? 'Iniciando sesión...' : (
                <>
                  Iniciar sesión
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </span>
          </Button>
        </motion.div>

        {/* Divider */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800 lg:border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-slate-950 lg:bg-slate-50 text-xs text-slate-500 uppercase">
              O
            </span>
          </div>
        </div>

        {/* Quick accounts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const passwordInput = document.getElementById('contrasena') as HTMLInputElement;
              if (emailInput) emailInput.value = 'admin@unt.edu.pe';
              if (passwordInput) passwordInput.value = '123456';
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 lg:text-slate-600 bg-slate-800/50 lg:bg-slate-100 hover:bg-slate-800 lg:hover:bg-slate-200 border border-slate-700 lg:border-slate-200 rounded-lg transition-colors"
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const passwordInput = document.getElementById('contrasena') as HTMLInputElement;
              if (emailInput) emailInput.value = 'coordinador.fi@unt.edu.pe';
              if (passwordInput) passwordInput.value = '123456';
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 lg:text-slate-600 bg-slate-800/50 lg:bg-slate-100 hover:bg-slate-800 lg:hover:bg-slate-200 border border-slate-700 lg:border-slate-200 rounded-lg transition-colors"
          >
            Coordinador
          </button>
          <button
            type="button"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const passwordInput = document.getElementById('contrasena') as HTMLInputElement;
              if (emailInput) emailInput.value = 'jorge.chavez@unt.edu.pe';
              if (passwordInput) passwordInput.value = '123456';
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 lg:text-slate-600 bg-slate-800/50 lg:bg-slate-100 hover:bg-slate-800 lg:hover:bg-slate-200 border border-slate-700 lg:border-slate-200 rounded-lg transition-colors"
          >
            Asesor
          </button>
          <button
            type="button"
            onClick={() => {
              const emailInput = document.getElementById('email') as HTMLInputElement;
              const passwordInput = document.getElementById('contrasena') as HTMLInputElement;
              if (emailInput) emailInput.value = '202310001@estudiante.unt.edu.pe';
              if (passwordInput) passwordInput.value = '123456';
            }}
            className="px-3 py-2 text-xs font-medium text-slate-400 lg:text-slate-600 bg-slate-800/50 lg:bg-slate-100 hover:bg-slate-800 lg:hover:bg-slate-200 border border-slate-700 lg:border-slate-200 rounded-lg transition-colors"
          >
            Estudiante
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center">
          Contraseña: <span className="font-mono bg-slate-800 lg:bg-slate-200 px-1.5 py-0.5 rounded">123456</span>
        </p>

        {/* Register Link */}
        <p className="text-center text-sm text-slate-400 lg:text-slate-600 pt-2">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="text-emerald-400 lg:text-emerald-600 hover:text-emerald-300 lg:hover:text-emerald-700 font-semibold transition-colors">
            Crear cuenta
          </Link>
        </p>
      </form>
    </div>
  );
}