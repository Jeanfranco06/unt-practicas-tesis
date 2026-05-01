'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { StudentForm } from '../../_components/StudentForm';
import { API_URL, fetchWithAuth, normalizeStudentFormData } from '../../_lib/students';
import type { Student } from '../../_lib/students';

export default function EditStudentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudent = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/students/${id}`);
        setStudent(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadStudent();
  }, [id]);

  const handleSubmit = async (data: ReturnType<typeof normalizeStudentFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/students/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Estudiante actualizado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/students');
    } catch (err: any) {
      toast({
        title: 'Error al actualizar estudiante',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar estudiante: {error}</p>
        <button
          onClick={() => router.push('/dashboard/students')}
          className="mt-4 text-sm underline"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Editar Estudiante</h1>
        <p className="text-muted-foreground text-sm mt-1">Actualiza la información del estudiante</p>
      </div>
      <StudentForm
        initialData={student}
        title="Información del Estudiante"
        submitLabel="Guardar Cambios"
        onCancel={() => router.push('/dashboard/students')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
