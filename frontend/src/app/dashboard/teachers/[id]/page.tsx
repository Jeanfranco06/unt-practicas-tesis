'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, AlertCircle, UserCog, Building2, BookOpen, Briefcase, MapPin, Phone, Mail, GraduationCap, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import {
  getTeacher,
  deleteTeacher,
  getFullName,
  getInitials,
  getAvatarColor,
  type Teacher,
} from '../_lib/teachers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function TeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const teacherId = Number(params.id);

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const loadTeacher = async () => {
      try {
        setIsLoading(true);
        const data = await getTeacher(teacherId);
        setTeacher(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeacher();
  }, [teacherId]);

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      await deleteTeacher(teacherId);
      toast({
        title: 'Docente eliminado',
        description: 'El docente ha sido eliminado exitosamente.',
      });
      router.push('/dashboard/teachers');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo eliminar el docente',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
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
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/teachers">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Docentes
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${getAvatarColor(teacher)} flex items-center justify-center text-white font-semibold text-xl`}>
              {getInitials(teacher)}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                {getFullName(teacher)}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {teacher.usuario?.email || 'Sin email'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-border hover:bg-muted">
              <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="border-red-200 hover:bg-red-50 text-red-600 dark:border-red-800 dark:hover:bg-red-950/20 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Academic Info */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            Información Académica
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Carrera
              </p>
              <p className="font-medium text-foreground mt-1">
                {teacher.carrera?.nombre || 'No asignada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Especialidad
              </p>
              <p className="font-medium text-foreground mt-1">
                {teacher.especialidad || 'No especificada'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Professional Info */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            Información Profesional
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Award className="w-4 h-4" />
                Categoría
              </p>
              <p className="font-medium text-foreground mt-1">
                {teacher.categoria || 'No asignada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <UserCog className="w-4 h-4" />
                Dedicación
              </p>
              <p className="font-medium text-foreground mt-1">
                {teacher.dedicacion || 'No especificada'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6 sm:col-span-2">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-amber-500" />
            Información de Contacto
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Oficina
              </p>
              <p className="font-medium text-foreground mt-1">
                {teacher.oficina || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono
              </p>
              <p className="font-medium text-foreground mt-1">
                {teacher.telefono || 'No especificado'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Info Link */}
      <motion.div variants={itemVariants} className="mt-6 p-4 bg-muted/50 rounded-xl">
        <p className="text-sm text-muted-foreground">
          Para gestionar los datos del usuario (nombre, email, contraseña), ve a la{' '}
          <Link
            href="/dashboard/users"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            gestión de usuarios
          </Link>
        </p>
      </motion.div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-lg"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              ¿Eliminar a {getFullName(teacher)}?
            </h3>
            <p className="text-muted-foreground mb-6">
              Esta acción no se puede deshacer. El docente será eliminado del sistema.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancelar
              </Button>
              <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                Eliminar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
