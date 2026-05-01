'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Search, GraduationCap, Calendar, Edit, Trash2, Eye, MoreHorizontal, AlertCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { API_URL, estadoColors, estadoLabels, fetchWithAuth } from './_lib/thesis';
import type { ThesisProject } from './_lib/thesis';

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
  projectId: number | null;
  title: string;
}

const statusOptions = [
  { value: 'todas', label: 'Todas', color: 'bg-muted text-muted-foreground' },
  { value: 'en_registro', label: 'En Registro', color: 'bg-muted text-muted-foreground' },
  { value: 'propuesto', label: 'Propuestas', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  { value: 'aprobado', label: 'Aprobadas', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  { value: 'en_desarrollo', label: 'En Desarrollo', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400' },
  { value: 'en_revision', label: 'En Revisión', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  { value: 'culminado', label: 'Culminadas', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { value: 'desaprobado', label: 'Desaprobadas', color: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  { value: 'cancelado', label: 'Canceladas', color: 'bg-slate-500/20 text-slate-400' },
];

export default function ThesisListPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [projects, setProjects] = useState<ThesisProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    projectId: null,
    title: '',
  });

  const loadProjects = async (incluirInactivos = false) => {
    try {
      setIsLoading(true);
      const url = incluirInactivos
        ? `${API_URL}/api/thesis/projects?incluirInactivos=true`
        : `${API_URL}/api/thesis/projects`;
      const data = await fetchWithAuth(url);
      setProjects(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar según el filtro de estado seleccionado
    // 'todas' y 'cancelado' necesitan incluir inactivos del backend
    // otros filtros solo cargan activos (por defecto en backend)
    loadProjects(statusFilter === 'todas' || statusFilter === 'cancelado');
  }, [statusFilter]);

  const handleDelete = async () => {
    if (!confirmAction.projectId) return;
    const id = confirmAction.projectId;
    setConfirmAction({ show: false, projectId: null, title: '' });

    try {
      await fetchWithAuth(`${API_URL}/api/thesis/projects/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'El proyecto fue eliminado exitosamente.',
        variant: 'default',
      });
      loadProjects();
    } catch (err: any) {
      toast({
        title: 'No se pudo eliminar el proyecto',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = (id: number, title: string) => {
    setConfirmAction({
      show: true,
      projectId: id,
      title,
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.areaConocimiento?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todas' || project.estado === statusFilter;
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
        <p>Error al cargar proyectos: {error}</p>
        <Button onClick={() => loadProjects(statusFilter === 'cancelado')} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tesis</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de proyectos de tesis</p>
        </div>
        <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
          <Link href="/dashboard/thesis/new">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Proyecto
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar proyectos..."
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
                  ? `${option.color} ring-1 ring-current font-medium`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
          {(searchTerm || statusFilter !== 'todas') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todas');
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
          {filteredProjects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-purple-500/20 rounded-lg">
                    <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{project.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <GraduationCap className="w-4 h-4" />
                      <span>{project.areaConocimiento || 'Área no especificada'}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          estadoColors[project.estado] || 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {estadoLabels[project.estado] || project.estado}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        ID Est: {project.estudianteId}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground mr-4">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(project.fechaRegistro).toLocaleDateString()}
                  </div>
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <Link
                        href={`/dashboard/thesis/${project.id}`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Ver detalle
                      </Link>
                      <Link
                        href={`/dashboard/thesis/${project.id}/edit`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      <button
                        onClick={() => showDeleteConfirm(project.id, project.titulo)}
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
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron proyectos</p>
            {(searchTerm || statusFilter !== 'todas') && (
              <p className="text-sm mt-2 opacity-70">Intenta ajustar los filtros de búsqueda</p>
            )}
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
            onClick={() => setConfirmAction({ show: false, projectId: null, title: '' })}
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
                  <h3 className="text-lg font-semibold text-foreground">Eliminar proyecto</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas eliminar el proyecto "{confirmAction.title}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, projectId: null, title: '' })}
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

