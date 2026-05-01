'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Calendar,
  FileText,
  ArrowLeft,
  Send,
  Search,
  Plus,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { API_URL, fetchWithAuth } from '@/app/dashboard/internships/_lib/offers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type Step = 'select-type' | 'externa-form' | 'offers-list';

export default function NuevaPracticaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('select-type');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for external internship
  const [formData, setFormData] = useState({
    nombreEmpresaExterna: '',
    asesorEmpresaNombre: '',
    horasTotalesRequeridas: '240',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
  });

  const handleSelectType = (type: 'externa' | 'oferta') => {
    if (type === 'oferta') {
      router.push('/student/practicas/ofertas');
    } else {
      setStep('externa-form');
    }
  };

  const handleSubmitExterna = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetchWithAuth(`${API_URL}/api/internships/my-internship`, {
        method: 'POST',
        body: JSON.stringify({
          nombreEmpresaExterna: formData.nombreEmpresaExterna,
          asesorEmpresaNombre: formData.asesorEmpresaNombre,
          horasTotalesRequeridas: parseInt(formData.horasTotalesRequeridas),
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin,
          observaciones: formData.observaciones,
        }),
      });

      toast({
        title: 'Solicitud enviada',
        description: 'Tu práctica externa ha sido registrada y está pendiente de aprobación.',
      });

      router.push('/student/practicas');
    } catch (err: any) {
      toast({
        title: 'Error al enviar',
        description: err.message || 'No se pudo registrar la práctica. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Selection Type Step
  if (step === 'select-type') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 w-full h-full flex flex-col"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/student/practicas">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a mis prácticas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Nueva Práctica Preprofesional</h1>
          <p className="text-muted-foreground mt-1">
            ¿Cómo es tu práctica? Selecciona una opción
          </p>
        </motion.div>

        {/* Options */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Option 1: Through Published Offer */}
          <button
            onClick={() => handleSelectType('oferta')}
            className="group relative flex flex-col items-center p-8 bg-card rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              A través de una oferta publicada
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Busca entre las ofertas de empresas registradas y postúlate a la que más te interese.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              <span>Ver ofertas disponibles</span>
            </div>
          </button>

          {/* Option 2: Direct Contact/External */}
          <button
            onClick={() => handleSelectType('externa')}
            className="group relative flex flex-col items-center p-8 bg-card rounded-xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Por contacto directo (externa)
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Ya tienes una empresa que te aceptó? Ingresa los datos manualmente para registrar tu práctica.
            </p>
            <div className="flex items-center gap-2 text-sm text-primary">
              <CheckCircle className="w-4 h-4" />
              <span>Registrar práctica externa</span>
            </div>
          </button>
        </motion.div>

        {/* Info Card */}
        <motion.div
          variants={itemVariants}
          className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground"
        >
          <p className="flex items-start gap-2">
            <Clock className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              <strong>Nota:</strong> Las prácticas por oferta publicada tienen proceso de selección por la empresa.
              Las prácticas externas requieren aprobación administrativa antes de iniciar.
            </span>
          </p>
        </motion.div>
      </motion.div>
    );
  }

  // External Internship Form
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full h-full flex flex-col"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setStep('select-type')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Registrar Práctica Externa</h1>
        <p className="text-muted-foreground mt-1">
          Ingresa los datos de la empresa donde realizarás tu práctica
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmitExterna}
        className="space-y-6"
      >
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Nombre de la empresa / institución
            </Label>
            <Input
              id="empresa"
              placeholder="Ej: Tech Solutions Perú S.A.C."
              value={formData.nombreEmpresaExterna}
              onChange={(e) => handleChange('nombreEmpresaExterna', e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Ingresa el nombre completo de la empresa donde realizarás tu práctica
            </p>
          </div>

          {/* Supervisor */}
          <div className="space-y-2">
            <Label htmlFor="supervisor" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Supervisor / Jefe directo en la empresa
            </Label>
            <Input
              id="supervisor"
              placeholder="Nombre completo del supervisor"
              value={formData.asesorEmpresaNombre}
              onChange={(e) => handleChange('asesorEmpresaNombre', e.target.value)}
              required
            />
          </div>

          {/* Fechas y Horas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fechaInicio" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Fecha de inicio
              </Label>
              <Input
                id="fechaInicio"
                type="date"
                value={formData.fechaInicio}
                onChange={(e) => handleChange('fechaInicio', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaFin" className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Fecha de fin estimada
              </Label>
              <Input
                id="fechaFin"
                type="date"
                value={formData.fechaFin}
                onChange={(e) => handleChange('fechaFin', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horas" className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Horas totales
              </Label>
              <Input
                id="horas"
                type="number"
                min="1"
                value={formData.horasTotalesRequeridas}
                onChange={(e) => handleChange('horasTotalesRequeridas', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Observaciones adicionales
            </Label>
            <Textarea
              id="observaciones"
              placeholder="Cualquier información adicional relevante sobre tu práctica..."
              rows={3}
              value={formData.observaciones}
              onChange={(e) => handleChange('observaciones', e.target.value)}
            />
          </div>

          {/* Info Alert */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>Importante:</strong> Tu práctica quedará en estado{' '}
                <em>"Pendiente de aprobación"</em>. El coordinador de prácticas revisará y aprobará
                tu solicitud antes de que puedas comenzar a registrar horas.
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => setStep('select-type')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
