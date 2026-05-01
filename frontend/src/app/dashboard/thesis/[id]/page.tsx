'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Edit, Trash2, BookOpen, GraduationCap, Users, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, estadoColors, estadoLabels, fetchWithAuth } from '../_lib/thesis';
import type { ThesisProject } from '../_lib/thesis';

interface ConfirmAction {
  show: boolean;
  action: 'delete' | null;
}

export default function ThesisDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<ThesisProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ show: false, action: null });

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/thesis/projects/${id}`);
        setProject(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar proyecto');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadProject();
  }, [id]);

  const handleDelete = async () => {
    setConfirmAction({ show: false, action: null });
    try {
      await fetchWithAuth(`${API_URL}/api/thesis/projects/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'El proyecto fue eliminado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/thesis');
    } catch (err: any) {
      toast({
        title: 'No se pudo eliminar el proyecto',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = () => {
    setConfirmAction({ show: true, action: 'delete' });
  };

  if (isLoading) return <div className="text-muted-foreground">Cargando proyecto...</div>;

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar proyecto: {error}</p>
      </div>
    );
  }

  if (!project) return <div className="text-muted-foreground">Proyecto no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-3 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/thesis">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a tesis
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Detalle de Proyecto</h1>
          <p className="text-muted-foreground text-sm mt-1">Información completa del proyecto de tesis</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-purple-500 hover:bg-purple-600 text-white">
            <Link href={`/dashboard/thesis/${project.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Link>
          </Button>
          <Button onClick={showDeleteConfirm} variant="outline" className="border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        </div>
      </div>

      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{project.titulo}</h2>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <GraduationCap className="w-4 h-4" />
              <span>{project.areaConocimiento || 'Área no especificada'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className={`px-2 py-1 text-xs rounded ${estadoColors[project.estado] || 'bg-muted text-muted-foreground'}`}>
              {estadoLabels[project.estado] || project.estado}
            </span>
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
              ID Est: {project.estudianteId}
            </span>
          </div>

          {project.resumen && (
            <div>
              <Label className="text-muted-foreground text-sm">Resumen</Label>
              <p className="text-foreground mt-1 whitespace-pre-line">{project.resumen}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha de Registro
              </Label>
              <p className="text-foreground text-sm mt-2">
                {new Date(project.fechaRegistro).toLocaleDateString()}
              </p>
            </div>
            {project.fechaAprobacion && (
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Fecha de Aprobación
                </Label>
                <p className="text-foreground text-sm mt-2">
                  {new Date(project.fechaAprobacion).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {project.asignaciones && project.asignaciones.length > 0 && (
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground text-sm flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" /> Asignaciones
              </Label>
              <div className="space-y-2">
                {project.asignaciones.map((asignacion) => (
                  <div key={asignacion.id} className="flex items-center gap-2 text-sm">
                    <span className="text-foreground">
                      {asignacion.docente?.nombre} {asignacion.docente?.apellido}
                    </span>
                    <span className="text-muted-foreground">-</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${asignacion.tipo === 'asesor' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'}`}>
                      {asignacion.tipo}
                    </span>
                    {asignacion.rolEspecifico && (
                      <span className="text-muted-foreground">({asignacion.rolEspecifico})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, action: null })}
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
                    ¿Estás seguro de que deseas eliminar el proyecto "{project?.titulo}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, action: null })}
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
    </div>
  );
}