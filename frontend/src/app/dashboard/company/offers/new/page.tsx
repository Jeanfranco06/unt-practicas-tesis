'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Users,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, fetchWithAuth } from '../../_lib/api';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface Agreement {
  id: number;
  tipo: string;
  objetoContrato: string;
  estado: string;
}

export default function NewOfferPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [isLoadingEmpresaId, setIsLoadingEmpresaId] = useState(true);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  
  const [formData, setFormData] = useState<{
    titulo: string;
    descripcion: string;
    requisitos: string;
    cupos: number | '';
    fechaInicioPostulacion: string;
    fechaFinPostulacion: string;
    fechaInicioPractica: string;
    fechaFinPractica: string;
    convenioId: string;
  }>({
    titulo: '',
    descripcion: '',
    requisitos: '',
    cupos: 1,
    fechaInicioPostulacion: '',
    fechaFinPostulacion: '',
    fechaInicioPractica: '',
    fechaFinPractica: '',
    convenioId: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Obtener empresaId - primero de localStorage, si no existe, del API
  useEffect(() => {
    const getEmpresaId = async () => {
      // Primero intentar de localStorage
      const storedEmpresaId = localStorage.getItem('empresaId');
      if (storedEmpresaId) {
        setEmpresaId(storedEmpresaId);
        setIsLoadingEmpresaId(false);
        return;
      }

      // Si no está en localStorage, obtener del API usando el user ID
      if (user?.sub) {
        try {
          const data = await fetchWithAuth(`${API_URL}/api/company-representatives/user/${user.sub}`);
          if (data?.empresaId) {
            const newEmpresaId = data.empresaId.toString();
            setEmpresaId(newEmpresaId);
            localStorage.setItem('empresaId', newEmpresaId);
          }
        } catch (err) {
          console.error('Error al obtener empresaId:', err);
        }
      }
      setIsLoadingEmpresaId(false);
    };

    if (isAuthenticated) {
      getEmpresaId();
    }
  }, [user, isAuthenticated]);

  useEffect(() => {
    const loadAgreements = async () => {
      if (!empresaId) return;
      try {
        const data = await fetchWithAuth(`${API_URL}/api/agreements/company/${empresaId}`);
        // Filtrar solo convenios vigentes
        const vigentes = data.filter((a: Agreement) => a.estado === 'vigente');
        setAgreements(vigentes);
      } catch (err) {
        // No mostrar error, los convenios son opcionales
        setAgreements([]);
      }
    };
    
    if (empresaId) {
      loadAgreements();
    }
  }, [empresaId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    if (!formData.requisitos.trim()) {
      newErrors.requisitos = 'Los requisitos son requeridos';
    }
    if (formData.cupos === '' || formData.cupos < 1) {
      newErrors.cupos = 'Debe haber al menos 1 cupo';
    }
    if (!formData.fechaInicioPostulacion) {
      newErrors.fechaInicioPostulacion = 'La fecha de inicio de postulación es requerida';
    }
    if (!formData.fechaFinPostulacion) {
      newErrors.fechaFinPostulacion = 'La fecha de fin de postulación es requerida';
    }
    if (!formData.fechaInicioPractica) {
      newErrors.fechaInicioPractica = 'La fecha de inicio de práctica es requerida';
    }
    if (!formData.fechaFinPractica) {
      newErrors.fechaFinPractica = 'La fecha de fin de práctica es requerida';
    }
    
    // Validar que las fechas tengan sentido
    if (formData.fechaInicioPostulacion && formData.fechaFinPostulacion) {
      if (new Date(formData.fechaInicioPostulacion) > new Date(formData.fechaFinPostulacion)) {
        newErrors.fechaFinPostulacion = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    if (formData.fechaInicioPractica && formData.fechaFinPractica) {
      if (new Date(formData.fechaInicioPractica) > new Date(formData.fechaFinPractica)) {
        newErrors.fechaFinPractica = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, completa todos los campos requeridos correctamente.',
        variant: 'destructive',
      });
      return;
    }

    if (!empresaId) {
      toast({
        title: 'Error',
        description: 'No se encontró el ID de la empresa. Por favor, recarga la página o inicia sesión nuevamente.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        empresaId: parseInt(empresaId),
        convenioId: formData.convenioId ? parseInt(formData.convenioId) : undefined,
        cupos: formData.cupos === '' ? 1 : parseInt(formData.cupos.toString()),
      };

      await fetchWithAuth(`${API_URL}/api/internships/offers`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      toast({
        title: 'Éxito',
        description: 'La oferta de práctica fue creada exitosamente.',
        variant: 'default',
      });

      router.push('/dashboard/company/offers');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo crear la oferta.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Mostrar carga mientras se obtiene empresaId
  if (isLoadingEmpresaId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Cargando información de la empresa...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si no se pudo obtener empresaId
  if (!empresaId) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">No se pudo obtener la información de la empresa</h2>
          <p className="text-muted-foreground mb-4">
            No se encontró el ID de la empresa asociada a tu cuenta. Por favor, contacta al administrador.
          </p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/company/offers">
            <ArrowLeft className="h-4 w-4 mr-1" /> Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nueva Oferta de Prácticas</h1>
          <p className="text-muted-foreground text-sm">
            Publica una nueva oferta para estudiantes de la UNT
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary" />
              Información General
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Título de la oferta <span className="text-red-500">*</span>
                </label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Practicante de Desarrollo de Software"
                  className={`mt-1 ${errors.titulo ? 'border-red-500' : ''}`}
                />
                {errors.titulo && <p className="text-xs text-red-500 mt-1">{errors.titulo}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Descripción
                </label>
                <Textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe las actividades y responsabilidades del practicante..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Requisitos <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.requisitos}
                  onChange={(e) => setFormData({ ...formData, requisitos: e.target.value })}
                  placeholder="Lista los requisitos: carrera, conocimientos, habilidades, etc."
                  className={`mt-1 min-h-[100px] ${errors.requisitos ? 'border-red-500' : ''}`}
                />
                {errors.requisitos && <p className="text-xs text-red-500 mt-1">{errors.requisitos}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Número de cupos <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  value={formData.cupos}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir campo vacío temporalmente o valores >= 1
                    if (value === '') {
                      setFormData({ ...formData, cupos: '' as any });
                    } else {
                      const numValue = parseInt(value);
                      setFormData({ ...formData, cupos: isNaN(numValue) ? 1 : numValue });
                    }
                  }}
                  onBlur={(e) => {
                    // Al salir del campo, asegurar que tenga al menos valor 1
                    const value = e.target.value;
                    if (value === '' || parseInt(value) < 1) {
                      setFormData({ ...formData, cupos: 1 });
                    }
                  }}
                  className={`mt-1 w-32 ${errors.cupos ? 'border-red-500' : ''}`}
                />
                {errors.cupos && <p className="text-xs text-red-500 mt-1">{errors.cupos}</p>}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4 pt-4 border-t border-border">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Fechas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Inicio de postulación <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.fechaInicioPostulacion}
                  onChange={(e) => setFormData({ ...formData, fechaInicioPostulacion: e.target.value })}
                  className={`mt-1 ${errors.fechaInicioPostulacion ? 'border-red-500' : ''}`}
                />
                {errors.fechaInicioPostulacion && <p className="text-xs text-red-500 mt-1">{errors.fechaInicioPostulacion}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Fin de postulación <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.fechaFinPostulacion}
                  onChange={(e) => setFormData({ ...formData, fechaFinPostulacion: e.target.value })}
                  className={`mt-1 ${errors.fechaFinPostulacion ? 'border-red-500' : ''}`}
                />
                {errors.fechaFinPostulacion && <p className="text-xs text-red-500 mt-1">{errors.fechaFinPostulacion}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Inicio de práctica <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.fechaInicioPractica}
                  onChange={(e) => setFormData({ ...formData, fechaInicioPractica: e.target.value })}
                  className={`mt-1 ${errors.fechaInicioPractica ? 'border-red-500' : ''}`}
                />
                {errors.fechaInicioPractica && <p className="text-xs text-red-500 mt-1">{errors.fechaInicioPractica}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">
                  Fin de práctica <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  value={formData.fechaFinPractica}
                  onChange={(e) => setFormData({ ...formData, fechaFinPractica: e.target.value })}
                  className={`mt-1 ${errors.fechaFinPractica ? 'border-red-500' : ''}`}
                />
                {errors.fechaFinPractica && <p className="text-xs text-red-500 mt-1">{errors.fechaFinPractica}</p>}
              </div>
            </div>
          </div>

          {/* Agreement */}
          {agreements.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-border">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Convenio (Opcional)
              </h2>
              
              <div>
                <label className="text-sm font-medium text-foreground">
                  Seleccionar convenio vigente
                </label>
                <select
                  value={formData.convenioId}
                  onChange={(e) => setFormData({ ...formData, convenioId: e.target.value })}
                  className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sin convenio específico</option>
                  {agreements.map((agreement) => (
                    <option key={agreement.id} value={agreement.id}>
                      {agreement.tipo === 'marco' ? 'Convenio Marco' : 'Convenio Específico'} - {agreement.objetoContrato?.substring(0, 50) || 'Sin descripción'}...
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Asociar esta oferta a un convenio existente facilita la gestión administrativa.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-foreground">Información importante</h4>
            <p className="text-sm text-muted-foreground mt-1">
              La oferta será creada en estado &quot;Borrador&quot;. Deberás publicarla desde el listado de ofertas 
              para que sea visible a los estudiantes. Asegúrate de que todas las fechas sean correctas 
              antes de publicar.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/company/offers')}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-2" />
                Crear Oferta
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
