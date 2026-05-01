'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, Briefcase, FileText, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';

// Mock data
const mockPractica = {
  id: 1,
  empresa: 'Tech Solutions Perú S.A.C.',
  cargo: 'Desarrollador Frontend',
  fechaInicio: '2024-03-01',
  fechaFin: '2024-08-31',
  supervisor: 'Ing. Carlos Mendoza',
  horasTotales: '320',
  descripcion: 'Desarrollo de interfaces de usuario con React y TypeScript. Implementación de componentes reutilizables y optimización de rendimiento.',
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function EditarPracticaPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(mockPractica);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Conectar con API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Cambios guardados',
        description: 'La práctica fue actualizada exitosamente.',
      });
      
      router.push(`/student/practicas/${params.id}`);
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo guardar los cambios. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 w-full"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/student/practicas/${params.id}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al detalle
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Editar Práctica</h1>
        <p className="text-muted-foreground mt-1">
          Modifica la información de tu práctica preprofesional
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Empresa / Institución
            </Label>
            <Input
              id="empresa"
              placeholder="Nombre de la empresa"
              value={formData.empresa}
              onChange={(e) => handleChange('empresa', e.target.value)}
              required
            />
          </div>

          {/* Cargo y Supervisor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cargo" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Cargo / Puesto
              </Label>
              <Input
                id="cargo"
                placeholder="Ej: Desarrollador Frontend"
                value={formData.cargo}
                onChange={(e) => handleChange('cargo', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supervisor" className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                Supervisor / Jefe directo
              </Label>
              <Input
                id="supervisor"
                placeholder="Nombre del supervisor"
                value={formData.supervisor}
                onChange={(e) => handleChange('supervisor', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Fechas */}
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
                Fecha de fin
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
              <Label htmlFor="horasTotales" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Horas totales
              </Label>
              <Input
                id="horasTotales"
                type="number"
                min="1"
                placeholder="320"
                value={formData.horasTotales}
                onChange={(e) => handleChange('horasTotales', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Descripción de actividades
            </Label>
            <Textarea
              id="descripcion"
              placeholder="Describe las actividades que realizarás durante la práctica..."
              rows={4}
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" asChild>
            <Link href={`/student/practicas/${params.id}`}>Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
