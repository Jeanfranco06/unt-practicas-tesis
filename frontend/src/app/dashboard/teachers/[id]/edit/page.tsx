'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, AlertCircle, UserCog, Building2, BookOpen, Briefcase, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  getTeacher,
  updateTeacher,
  getCareers,
  getFullName,
  categoriaOptions,
  dedicacionOptions,
  type Teacher,
  type TeacherFormData,
} from '../../_lib/teachers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function EditTeacherPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const teacherId = Number(params.id);

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [careers, setCareers] = useState<{ id: number; nombre: string }[]>([]);
  const [formData, setFormData] = useState<TeacherFormData>({
    usuarioId: '',
    carreraId: '',
    especialidad: '',
    categoria: '',
    dedicacion: '',
    oficina: '',
    telefono: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [teacherData, careersData] = await Promise.all([
          getTeacher(teacherId),
          getCareers(),
        ]);
        setTeacher(teacherData);
        setCareers(careersData);
        setFormData({
          usuarioId: teacherData.usuarioId,
          carreraId: teacherData.carreraId,
          especialidad: teacherData.especialidad || '',
          categoria: teacherData.categoria || '',
          dedicacion: teacherData.dedicacion || '',
          oficina: teacherData.oficina || '',
          telefono: teacherData.telefono || '',
        });
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [teacherId]);

  const handleChange = (field: keyof TeacherFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: keyof TeacherFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const validateForm = (): boolean => {
    const newTouched: Record<string, boolean> = {
      carreraId: true,
      especialidad: true,
      categoria: true,
      dedicacion: true,
    };
    setTouched(newTouched);

    return !!formData.carreraId && !!formData.especialidad && !!formData.categoria && !!formData.dedicacion;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Error de validación',
        description: 'Por favor completa todos los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateTeacher(teacherId, {
        carreraId: Number(formData.carreraId),
        especialidad: formData.especialidad,
        categoria: formData.categoria,
        dedicacion: formData.dedicacion,
        oficina: formData.oficina || undefined,
        telefono: formData.telefono || undefined,
      });

      toast({
        title: 'Docente actualizado',
        description: 'Los datos del docente han sido actualizados exitosamente.',
      });
      router.push('/dashboard/teachers');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo actualizar el docente',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !teacher) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error al cargar el docente: {error || 'No encontrado'}</span>
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/teachers">Volver a la lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/dashboard/teachers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Docentes
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <UserCog className="w-8 h-8 text-blue-500" />
          Editar Docente
        </h1>
        <p className="text-muted-foreground mt-1">
          {getFullName(teacher)} - {teacher.usuario?.email}
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-6 bg-card rounded-xl border border-border p-6"
      >
        {/* Info del Usuario (Solo lectura) */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <UserCog className="w-4 h-4" />
            Información del Usuario
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <p className="font-medium">{getFullName(teacher)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium">{teacher.usuario?.email || 'N/A'}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Para cambiar los datos del usuario, ve a la{' '}
            <Link href="/dashboard/users" className="text-blue-600 hover:underline">
              gestión de usuarios
            </Link>
          </p>
        </div>

        {/* Carrera */}
        <div className="grid gap-2">
          <Label htmlFor="carreraId" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Carrera <span className="text-red-500">*</span>
          </Label>
          <select
            id="carreraId"
            value={formData.carreraId ? String(formData.carreraId) : ''}
            onChange={(e) => handleChange('carreraId', Number(e.target.value))}
            onBlur={() => handleBlur('carreraId')}
            className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              !formData.carreraId && touched.carreraId ? 'border-red-500' : 'border-border'
            }`}
          >
            <option value="">Seleccionar carrera</option>
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.nombre}
              </option>
            ))}
          </select>
          {!formData.carreraId && touched.carreraId && (
            <p className="text-sm text-red-600 dark:text-red-400">Debe seleccionar una carrera</p>
          )}
        </div>

        {/* Especialidad y Categoría */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="especialidad" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Especialidad <span className="text-red-500">*</span>
            </Label>
            <Input
              id="especialidad"
              value={formData.especialidad}
              onChange={(e) => handleChange('especialidad', e.target.value)}
              onBlur={() => handleBlur('especialidad')}
              placeholder="Ej: Ingeniería de Software"
              className={!formData.especialidad && touched.especialidad ? 'border-red-500' : ''}
            />
            {!formData.especialidad && touched.especialidad && (
              <p className="text-sm text-red-600 dark:text-red-400">La especialidad es requerida</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoria" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Categoría <span className="text-red-500">*</span>
            </Label>
            <select
              id="categoria"
              value={formData.categoria}
              onChange={(e) => handleChange('categoria', e.target.value)}
              onBlur={() => handleBlur('categoria')}
              className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                !formData.categoria && touched.categoria ? 'border-red-500' : 'border-border'
              }`}
            >
              {categoriaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {!formData.categoria && touched.categoria && (
              <p className="text-sm text-red-600 dark:text-red-400">La categoría es requerida</p>
            )}
          </div>
        </div>

        {/* Dedicación */}
        <div className="grid gap-2">
          <Label htmlFor="dedicacion" className="flex items-center gap-2">
            <UserCog className="w-4 h-4 text-muted-foreground" />
            Dedicación <span className="text-red-500">*</span>
          </Label>
          <select
            id="dedicacion"
            value={formData.dedicacion}
            onChange={(e) => handleChange('dedicacion', e.target.value)}
            onBlur={() => handleBlur('dedicacion')}
            className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              !formData.dedicacion && touched.dedicacion ? 'border-red-500' : 'border-border'
            }`}
          >
            {dedicacionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {!formData.dedicacion && touched.dedicacion && (
            <p className="text-sm text-red-600 dark:text-red-400">La dedicación es requerida</p>
          )}
        </div>

        {/* Oficina y Teléfono */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="oficina" className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Oficina
            </Label>
            <Input
              id="oficina"
              value={formData.oficina}
              onChange={(e) => handleChange('oficina', e.target.value)}
              placeholder="Ej: A-203, Edificio Central"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              placeholder="Ej: +51 999 888 777"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-border">
          <Button asChild variant="outline" disabled={isSaving}>
            <Link href="/dashboard/teachers">Cancelar</Link>
          </Button>
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
