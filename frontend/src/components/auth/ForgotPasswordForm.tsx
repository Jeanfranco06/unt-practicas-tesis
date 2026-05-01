'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'El correo es requerido').email('Correo inválido'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
    } catch (err) {
      setError('No pudimos procesar tu solicitud. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isSent ? (
        <>
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center space-y-2"
          >
            <h2 className="text-2xl font-bold text-white lg:text-slate-900">¿Olvidaste tu contraseña?</h2>
            <p className="text-sm text-slate-400 lg:text-slate-500">
              Ingresa tu correo institucional y te enviaremos un enlace para restablecerla
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

            <motion.div variants={itemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
              <Button
                type="submit"
                loading={isLoading}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 lg:bg-emerald-600 lg:hover:bg-emerald-500 text-slate-950 lg:text-white font-semibold rounded-lg transition-colors"
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
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
            <h3 className="text-xl font-bold text-white lg:text-slate-900">¡Correo enviado!</h3>
            <p className="text-slate-400 lg:text-slate-500 text-sm">
              Hemos enviado un enlace de recuperación a tu correo institucional.
              Revisa tu bandeja de entrada.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-lg border-slate-700 lg:border-slate-200 bg-transparent lg:bg-white text-slate-300 lg:text-slate-700 hover:bg-slate-800 lg:hover:bg-slate-50"
            asChild
          >
            <Link href="/login" className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </Button>

          <p className="text-xs text-slate-500">
            ¿No recibiste el correo?{' '}
            <button
              onClick={() => setIsSent(false)}
              className="text-emerald-400 lg:text-emerald-600 hover:text-emerald-300 lg:hover:text-emerald-700 font-medium"
            >
              Intenta nuevamente
            </button>
          </p>
        </motion.div>
      )}
    </div>
  );
}
