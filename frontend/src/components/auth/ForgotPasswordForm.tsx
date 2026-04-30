'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, Send, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
});

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    setError(null);
    try {
      // Simular API call - reemplazar con llamada real cuando exista endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSent(true);
      reset();
    } catch (err) {
      setError('No pudimos procesar tu solicitud. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {!isSent ? (
        <>
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center space-y-3">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
              className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl shadow-glow mb-2"
            >
              <KeyRound className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-slate-500 text-sm">
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
                className="p-3 bg-red-50 border border-red-100 rounded-xl"
              >
                <p className="text-sm text-red-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            variants={itemVariants}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                Correo Institucional
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="estudiante@unt.edu.pe"
                className={`h-12 bg-slate-50 border-slate-200 rounded-xl ${errors.email ? 'border-red-300' : ''}`}
                {...register('email')}
              />
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-500"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <Button
                type="submit"
                loading={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25"
              >
                <span className="flex items-center gap-2">
                  {isLoading ? 'Enviando...' : (
                    <>
                      Enviar enlace
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </span>
              </Button>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Volver al inicio de sesión
              </Link>
            </motion.div>
          </motion.form>

          {/* Security Note */}
          <motion.div
            variants={itemVariants}
            className="p-4 bg-slate-50 rounded-xl border border-slate-100"
          >
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-slate-700">Tu seguridad es importante</h4>
                <p className="text-xs text-slate-500 mt-1">
                  El enlace de recuperación expirará en 24 horas por tu seguridad.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="text-center space-y-6 py-4"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg shadow-green-500/30"
          >
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>

          <div className="space-y-2">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-bold text-slate-900"
            >
              ¡Correo enviado!
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-sm leading-relaxed"
            >
              Hemos enviado un enlace de recuperación a tu correo institucional.
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="pt-2"
          >
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-slate-200 hover:bg-slate-50"
              asChild
            >
              <Link href="/login" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </Button>
          </motion.div>

          {/* Help Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xs text-slate-400"
          >
            ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
            <button
              onClick={() => setIsSent(false)}
              className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
            >
              intenta nuevamente
            </button>
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
}