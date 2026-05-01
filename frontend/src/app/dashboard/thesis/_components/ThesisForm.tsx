'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ThesisFormData, ThesisProject } from '../_lib/thesis';
import { ThesisEstado, API_URL, fetchWithAuth, normalizeThesisFormData } from '../_lib/thesis';

interface Student {
  id: number;
  usuario?: {
    nombre: string;
    apellido: string;
  };
  codigoUniversitario: string;
}

interface ThesisFormProps {
  initialData?: ThesisProject | null;
  submitLabel: string;
  title: string;
  onCancel: () => void;
  onSubmit: (data: ReturnType<typeof normalizeThesisFormData>) => Promise<void> | void;
}

export function ThesisForm({ initialData, submitLabel, title, onCancel, onSubmit }: ThesisFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ThesisFormData>({
    estudianteId: '',
    titulo: '',
    resumen: '',
    areaConocimiento: '',
    estado: ThesisEstado.EN_REGISTRO,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchWithAuth(`${API_URL}/api/students`);
        const activeStudents = Array.isArray(data) ? data.filter((s: Student) => s.id) : [];
        setStudents(activeStudents);
        setStudentsError(null);

        if (!initialData && activeStudents.length > 0) {
          setFormData((current) => ({
            ...current,
            estudianteId: current.estudianteId || activeStudents[0].id,
          }));
        }
      } catch (err: any) {
        setStudentsError(err.message || 'Error al cargar estudiantes');
      }
    };

    loadStudents();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        estudianteId: initialData.estudianteId || '',
        titulo: initialData.titulo || '',
        resumen: initialData.resumen || '',
        areaConocimiento: initialData.areaConocimiento || '',
        estado: initialData.estado || ThesisEstado.EN_REGISTRO,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.estudianteId) {
      setStudentsError('Selecciona un estudiante');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(normalizeThesisFormData(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="titulo">Título</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="bg-background border-border text-foreground"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="resumen">Resumen</Label>
          <textarea
            id="resumen"
            value={formData.resumen}
            onChange={(e) => setFormData({ ...formData, resumen: e.target.value })}
            className="bg-background border border-border text-foreground rounded-md p-2 min-h-[100px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="areaConocimiento">Área de Conocimiento</Label>
            <Input
              id="areaConocimiento"
              value={formData.areaConocimiento}
              onChange={(e) => setFormData({ ...formData, areaConocimiento: e.target.value })}
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="estado">Estado</Label>
            <select
              id="estado"
              value={formData.estado}
              onChange={(e) => setFormData({ ...formData, estado: e.target.value as ThesisEstado })}
              className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              required
            >
              <option value={ThesisEstado.EN_REGISTRO}>En Registro</option>
              <option value={ThesisEstado.PROPUESTO}>Propuesto</option>
              <option value={ThesisEstado.APROBADO}>Aprobado</option>
              <option value={ThesisEstado.EN_DESARROLLO}>En Desarrollo</option>
              <option value={ThesisEstado.EN_REVISION}>En Revisión</option>
              <option value={ThesisEstado.CULMINADO}>Culminado</option>
              <option value={ThesisEstado.DESAPROBADO}>Desaprobado</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="estudianteId">Estudiante</Label>
          <select
            id="estudianteId"
            value={formData.estudianteId ? String(formData.estudianteId) : ''}
            onChange={(e) => setFormData({ ...formData, estudianteId: Number(e.target.value) })}
            className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={students.length === 0}
            required
          >
            {students.length === 0 ? (
              <option value="">No hay estudiantes disponibles</option>
            ) : (
              students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.usuario?.nombre || ''} {student.usuario?.apellido || ''} ({student.codigoUniversitario})
                </option>
              ))
            )}
          </select>
          {studentsError && <p className="text-sm text-red-600 dark:text-red-400">{studentsError}</p>}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-border text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-purple-500 hover:bg-purple-600 text-white">
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
