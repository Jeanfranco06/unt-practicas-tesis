'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Edit, Trash2, GraduationCap, Mail, BookOpen, Award, FileText, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, fetchWithAuth } from '../_lib/students';
import type { Student } from '../_lib/students';

interface ConfirmAction {
  show: boolean;
  action: 'delete' | null;
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ show: false, action: null });

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/students/${id}`);
        setStudent(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar estudiante');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadStudent();
  }, [id]);

  const handleDelete = async () => {
    setConfirmAction({ show: false, action: null });
    try {
      await fetchWithAuth(`${API_URL}/api/students/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'El estudiante fue eliminado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/students');
    } catch (err: any) {
      toast({
        title: 'No se pudo eliminar el estudiante',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = () => {
    setConfirmAction({ show: true, action: 'delete' });
  };

  if (isLoading) return <div className="text-muted-foreground">Cargando estudiante...</div>;

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar estudiante: {error}</p>
      </div>
    );
  }

  if (!student) return <div className="text-muted-foreground">Estudiante no encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-3 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/students">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a estudiantes
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Detalle de Estudiante</h1>
          <p className="text-muted-foreground text-sm mt-1">Información completa del estudiante</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white">
            <Link href={`/dashboard/students/${student.id}/edit`}>
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
            <h2 className="text-xl font-semibold text-foreground">
              {student.usuario?.nombre} {student.usuario?.apellidoPaterno} {student.usuario?.apellidoMaterno}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>{student.usuario?.email || 'Email no disponible'}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
              Código: {student.codigoUniversitario}
            </span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs rounded">
              Promedio: {student.promedioGeneral ?? 'N/A'}
            </span>
            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded">
              {student.creditosAprobados} créditos
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Escuela Profesional
              </Label>
              <p className="text-foreground text-sm mt-2">{student.escuelaProfesional}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Año de Ingreso
              </Label>
              <p className="text-foreground text-sm mt-2">{student.anioIngreso}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <Award className="w-4 h-4" /> Promedio General
              </Label>
              <p className="text-foreground text-sm mt-2">{student.promedioGeneral ?? 'No registrado'}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-muted-foreground text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" /> Créditos Aprobados
              </Label>
              <p className="text-foreground text-sm mt-2">{student.creditosAprobados}</p>
            </div>
          </div>

          {student.expedienteAcademicoUrl && (
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground text-sm">Expediente Académico</Label>
              <a
                href={student.expedienteAcademicoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 text-sm mt-1 block hover:underline"
              >
                Ver documento
              </a>
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
                  <h3 className="text-lg font-semibold text-foreground">Eliminar estudiante</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas eliminar al estudiante "{student?.usuario?.nombre} {student?.usuario?.apellidoPaterno} {student?.usuario?.apellidoMaterno}"? Esta acción no se puede deshacer.
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
