'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, GraduationCap, Mail, BookOpen, Edit, Trash2, Eye, MoreHorizontal, AlertCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { API_URL, fetchWithAuth } from './_lib/students';
import type { Student } from './_lib/students';

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
  studentId: number | null;
  title: string;
}

const statusOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Activos', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { value: 'inactivos', label: 'Inactivos', color: 'bg-slate-500/20 text-slate-400' },
];

export default function StudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    studentId: null,
    title: '',
  });

  const loadStudents = async (incluirInactivos = false) => {
    try {
      setIsLoading(true);
      const url = incluirInactivos
        ? `${API_URL}/api/students?incluirInactivos=true`
        : `${API_URL}/api/students`;
      const data = await fetchWithAuth(url);
      setStudents(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar según el filtro de estado seleccionado
    // 'todos' e 'inactivos' necesitan incluir inactivos del backend
    // 'activos' solo carga activos (por defecto en backend)
    loadStudents(statusFilter !== 'activos');
  }, [statusFilter]);

  const handleDelete = async () => {
    if (!confirmAction.studentId) return;
    const id = confirmAction.studentId;
    setConfirmAction({ show: false, studentId: null, title: '' });

    try {
      await fetchWithAuth(`${API_URL}/api/students/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'El estudiante fue eliminado exitosamente.',
        variant: 'default',
      });
      loadStudents();
    } catch (err: any) {
      toast({
        title: 'No se pudo eliminar el estudiante',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = (id: number, title: string) => {
    setConfirmAction({
      show: true,
      studentId: id,
      title,
    });
  };

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.usuario?.nombre || ''} ${student.usuario?.apellido || ''}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      fullName.includes(searchLower) ||
      student.codigoUniversitario.toLowerCase().includes(searchLower) ||
      student.escuelaProfesional.toLowerCase().includes(searchLower) ||
      student.usuario?.email?.toLowerCase().includes(searchLower);
    
    // Filtrar por estado activo/inactivo
    let matchesStatus = true;
    if (statusFilter === 'activos') matchesStatus = student.activo === true;
    else if (statusFilter === 'inactivos') matchesStatus = student.activo === false;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar estudiantes: {error}</p>
        <Button onClick={() => loadStudents(statusFilter !== 'activos')} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Estudiantes</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de estudiantes registrados</p>
        </div>
        <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
          <Link href="/dashboard/students/new">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Estudiante
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar estudiantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground text-sm mr-1">
            <Filter className="w-4 h-4" />
            <span>Estado:</span>
          </div>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                statusFilter === option.value
                  ? `${option.color || 'bg-muted text-muted-foreground'} ring-1 ring-current font-medium`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
          {(searchTerm || statusFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredStudents.map((student) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-amber-500/20 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {student.usuario?.nombre} {student.usuario?.apellido}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>{student.escuelaProfesional}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      <span>{student.usuario?.email}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                        Código: {student.codigoUniversitario}
                      </span>
                      <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded">
                        Promedio: {student.promedioGeneral ?? 'N/A'}
                      </span>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">
                        {student.creditosAprobados} créditos
                      </span>
                      {student.activo ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">
                          Activo
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded">
                          Inactivo
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <Link
                        href={`/dashboard/students/${student.id}`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Ver detalle
                      </Link>
                      <Link
                        href={`/dashboard/students/${student.id}/edit`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      <button
                        onClick={() =>
                          showDeleteConfirm(student.id, `${student.usuario?.nombre} ${student.usuario?.apellido}`)
                        }
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-muted flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron estudiantes</p>
            {searchTerm && <p className="text-sm mt-2 opacity-70">Intenta ajustar la búsqueda</p>}
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, studentId: null, title: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Eliminar estudiante</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas eliminar al estudiante "{confirmAction.title}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, studentId: null, title: '' })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
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
