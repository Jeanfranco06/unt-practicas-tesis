'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc/react';
import { getUserRole, getDashboardRouteByRole } from '@/lib/jwt';

// Schema inline para evitar conflictos
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
  contrasena: z.string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'Mínimo 6 caracteres'),
});

type LoginInput = z.infer<typeof loginSchema>;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
};

const shakeVariants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      contrasena: '',
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      document.cookie = `accessToken=${data.accessToken}; path=/`;
      
      // Decode JWT to get user role and redirect accordingly
      const role = getUserRole(data.accessToken);
      const dashboardRoute = getDashboardRouteByRole(role);
      router.push(dashboardRoute);
    },
    onError: (error) => {
      setLoginError(error.message || 'Credenciales inválidas');
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setLoginError(null);
    loginMutation.mutate({ email: data.email, contrasena: data.contrasena });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Premium */}
      <motion.div variants={itemVariants} className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-glow mb-2 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <Shield className="w-7 h-7 text-white relative z-10" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Bienvenido de vuelta
        </h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Ingresa tus credenciales institucionales para continuar
        </p>
      </motion.div>

      {/* Error Alert */}
      <AnimatePresence>
        {loginError && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 bg-red-50 border border-red-100 rounded-xl"
          >
            <p className="text-sm text-red-600 font-medium">{loginError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Formulario Premium */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <motion.div variants={itemVariants} className="space-y-2">
          <Label 
            htmlFor="email" 
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-slate-400" />
            Correo Institucional
          </Label>
          <motion.div
            whileFocus={{ scale: 1.01 }}
            className="relative"
          >
            <Input
              id="email"
              type="email"
              placeholder="estudiante@unt.edu.pe"
              className={`h-12 bg-slate-50 border-slate-200 rounded-xl transition-all duration-200 focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 ${
                errors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''
              }`}
              {...register('email')}
            />
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mt-1.5 text-xs text-red-500 font-medium"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-2">
          <Label 
            htmlFor="contrasena" 
            className="text-sm font-medium text-slate-700 flex items-center gap-2"
          >
            <Lock className="w-4 h-4 text-slate-400" />
            Contraseña
          </Label>
          <div className="relative">
            <Input
              id="contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`h-12 bg-slate-50 border-slate-200 rounded-xl pr-12 transition-all duration-200 focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 ${
                errors.contrasena ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''
              }`}
              {...register('contrasena')}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </motion.button>
          </div>
          <AnimatePresence>
            {errors.contrasena && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="mt-1.5 text-xs text-red-500 font-medium"
              >
                {errors.contrasena.message}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all" />
              <svg
                className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="group-hover:text-slate-800 transition-colors">Recordarme</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors relative group"
          >
            ¿Olvidaste tu contraseña?
            <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
            loading={loginMutation.isLoading}
            className="w-full h-12 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              {loginMutation.isLoading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  Iniciar Sesión
                  <motion.span
                    className="inline-block"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-4 h-4" />
                  </motion.span>
                </>
              )}
            </span>
          </Button>
        </motion.div>

        {/* Divider */}
        <motion.div variants={itemVariants} className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-white text-xs font-medium text-slate-400 uppercase tracking-wider">
              O continúa con
            </span>
          </div>
        </motion.div>

        {/* Demo Accounts */}
        <motion.div variants={itemVariants} className="space-y-2">
          <p className="text-xs text-slate-500 text-center font-medium">
            Cuentas de demostración disponibles
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { email: 'admin@unt.edu.pe', label: 'Admin' },
              { email: 'estudiante@unt.edu.pe', label: 'Estudiante' },
            ].map((account) => (
              <motion.button
                key={account.email}
                type="button"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const emailInput = document.getElementById('email') as HTMLInputElement;
                  const passwordInput = document.getElementById('contrasena') as HTMLInputElement;
                  if (emailInput) emailInput.value = account.email;
                  if (passwordInput) passwordInput.value = '123456';
                }}
                className="px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-primary-500" />
                {account.label}
              </motion.button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Contraseña para todas: <span className="font-mono bg-slate-100 px-1 rounded">123456</span>
          </p>
        </motion.div>

        {/* Register Link */}
        <motion.div variants={itemVariants} className="text-center pt-2">
          <p className="text-sm text-slate-600">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/register"
              className="font-semibold text-primary-600 hover:text-primary-700 transition-colors relative inline-block group"
            >
              Regístrate aquí
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-primary-500 group-hover:w-full transition-all duration-300" />
            </Link>
          </p>
        </motion.div>
      </form>
    </motion.div>
  );
}