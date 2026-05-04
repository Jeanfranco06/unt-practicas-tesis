'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, Eye, AlertCircle, Filter, X, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import {
  getTeachers,
  deleteTeacher,
  getFullName,
  getInitials,
  getAvatarColor,
  type Teacher,
} from './_lib/teachers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface ConfirmAction {
  show: boolean;
  teacherId: number | null;
  title: string;
}

export default function TeachersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    teacherId: null,
    title: '',
  });

  const loadTeachers = async () => {
    try {
      setIsLoading(true);
      const data = await getTeachers();
      setTeachers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleDelete = async () => {
    if (!confirmAction.teacherId) return;
    const id = confirmAction.teacherId;
    setConfirmAction({ show: false, teacherId: null, title: '' });

    try {
      await deleteTeacher(id);
      toast({
        title: 'Docente eliminado',
        description: 'El docente ha sido eliminado exitosamente.',
      });
      loadTeachers();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo eliminar el docente.',
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = (teacher: Teacher) => {
    setConfirmAction({
      show: true,
      teacherId: teacher.id,
      title: `¿Eliminar a ${getFullName(teacher)}?`,
    });
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = getFullName(teacher).toLowerCase();
    const email = teacher.usuario?.email?.toLowerCase() || '';
    const especialidad = teacher.especialidad?.toLowerCase() || '';
    const carrera = teacher.carrera?.nombre?.toLowerCase() || '';

    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      especialidad.includes(searchLower) ||
      carrera.includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error al cargar docentes: {error}</span>
          </div>
          <Button onClick={loadTeachers} variant="outline" className="mt-4">
            Reintentar
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
      className="p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-blue-500" />
            Gestión de Docentes
          </h1>
          <p className="text-muted-foreground mt-1">
            {teachers.length} docente{teachers.length !== 1 ? 's' : ''} registrado{teachers.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link href="/dashboard/users/new/teacher">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Docente
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email, especialidad o carrera..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Teachers List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-xl border border-border">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'No se encontraron docentes' : 'No hay docentes registrados'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza registrando docentes para gestionar asesores y coordinadores'}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
                <Link href="/dashboard/users/new/teacher">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primer Docente
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredTeachers.map((teacher) => (
              <motion.div
                key={teacher.id}
                variants={itemVariants}
                layout
                className="group bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <Link href={`/dashboard/teachers/${teacher.id}`} className="flex items-start gap-4 flex-1 hover:opacity-80 transition-opacity">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(teacher)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                      {getInitials(teacher)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-lg">
                        {getFullName(teacher)}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {teacher.usuario?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {teacher.usuario.email}
                          </span>
                        )}
                        {teacher.carrera?.nombre && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {teacher.carrera.nombre}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {teacher.especialidad && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                            {teacher.especialidad}
                          </span>
                        )}
                        {teacher.categoria && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                            {teacher.categoria}
                          </span>
                        )}
                        {teacher.dedicacion && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full">
                            {teacher.dedicacion}
                          </span>
                        )}
                      </div>
                      {(teacher.oficina || teacher.telefono) && (
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {teacher.oficina && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {teacher.oficina}
                            </span>
                          )}
                          {teacher.telefono && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {teacher.telefono}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted"
                    >
                      <Link href={`/dashboard/teachers/${teacher.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted"
                    >
                      <Link href={`/dashboard/teachers/${teacher.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showDeleteConfirm(teacher)}
                      className="border-red-200 hover:bg-red-50 text-red-600 dark:border-red-800 dark:hover:bg-red-950/20 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, teacherId: null, title: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-lg"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">{confirmAction.title}</h3>
              <p className="text-muted-foreground mb-6">
                Esta acción no se puede deshacer. El docente será eliminado del sistema.
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction({ show: false, teacherId: null, title: '' })}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Eliminar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
