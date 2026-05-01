'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';

const resetPasswordSchema = z.object({
  contrasena: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmarContrasena: z.string().min(6, 'Mínimo 6 caracteres'),
}).refine((data) => data.contrasena === data.confirmarContrasena, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmarContrasena'],
});

type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { contrasena: '', confirmarContrasena: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setError('Token inválido o faltante');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          contrasena: data.contrasena,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Error al restablecer la contraseña');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos restablecer tu contraseña. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6 py-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full">
          <AlertCircle className="w-8 h-8 text-white" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white lg:text-slate-900">Enlace inválido</h3>
          <p className="text-slate-400 lg:text-slate-500 text-sm">
            El enlace de restablecimiento es inválido o ha expirado.
            Solicita un nuevo enlace de recuperación.
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full h-11 rounded-lg border-slate-700 lg:border-slate-200 bg-transparent lg:bg-white text-slate-300 lg:text-slate-700 hover:bg-slate-800 lg:hover:bg-slate-50"
          asChild
        >
          <Link href="/forgot-password" className="flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Solicitar nuevo enlace
          </Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {!isSuccess ? (
        <>
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-2"
          >
            <h2 className="text-2xl font-bold text-white lg:text-slate-900">Restablecer contraseña</h2>
            <p className="text-sm text-slate-400 lg:text-slate-500">
              Ingresa tu nueva contraseña
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-sm text-red-400">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <motion.div variants={itemVariants} initial="hidden" animate="visible">
              <Label htmlFor="contrasena" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                Nueva contraseña
              </Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.contrasena ? 'border-red-500' : ''}`}
                {...register('contrasena')}
              />
              {errors.contrasena && <p className="text-xs text-red-400 mt-1">{errors.contrasena.message}</p>}
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Label htmlFor="confirmarContrasena" className="text-sm font-medium text-slate-300 lg:text-slate-700 flex items-center gap-2 mb-1.5">
                <Lock className="w-4 h-4 text-slate-500" />
                Confirmar contraseña
              </Label>
              <Input
                id="confirmarContrasena"
                type="password"
                placeholder="••••••••"
                className={`h-11 bg-slate-800/50 lg:bg-white border-slate-700 lg:border-slate-200 text-white lg:text-slate-900 placeholder:text-slate-500 rounded-lg focus:border-emerald-500 focus:ring-emerald-500/20 ${errors.confirmarContrasena ? 'border-red-500' : ''}`}
                {...register('confirmarContrasena')}
              />
              {errors.confirmarContrasena && <p className="text-xs text-red-400 mt-1">{errors.confirmarContrasena.message}</p>}
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 lg:bg-emerald-600 lg:hover:bg-emerald-500 text-slate-950 lg:text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
              </Button>
            </motion.div>

            <p className="text-center text-sm text-slate-400 lg:text-slate-600">
              <Link href="/login" className="inline-flex items-center gap-1 text-emerald-400 lg:text-emerald-600 hover:text-emerald-300 lg:hover:text-emerald-700 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </p>
          </form>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 py-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white lg:text-slate-900">¡Contraseña restablecida!</h3>
            <p className="text-slate-400 lg:text-slate-500 text-sm">
              Tu contraseña ha sido actualizada exitosamente.
              Ahora puedes iniciar sesión con tu nueva contraseña.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-lg border-slate-700 lg:border-slate-200 bg-transparent lg:bg-white text-slate-300 lg:text-slate-700 hover:bg-slate-800 lg:hover:bg-slate-50"
            onClick={() => router.push('/login')}
          >
            Ir al inicio de sesión
          </Button>
        </motion.div>
      )}
    </div>
  );
}
