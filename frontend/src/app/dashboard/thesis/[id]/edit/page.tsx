'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { ThesisForm } from '../../_components/ThesisForm';
import { API_URL, fetchWithAuth, normalizeThesisFormData } from '../../_lib/thesis';
import type { ThesisProject } from '../../_lib/thesis';

export default function EditThesisPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<ThesisProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/thesis/projects/${id}`);
        setProject(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadProject();
  }, [id]);

  const handleSubmit = async (data: ReturnType<typeof normalizeThesisFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/thesis/projects/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Proyecto de tesis actualizado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/thesis');
    } catch (err: any) {
      toast({
        title: 'Error al actualizar proyecto',
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
        <p>Error al cargar proyecto: {error}</p>
        <button
          onClick={() => router.push('/dashboard/thesis')}
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
        <h1 className="text-2xl font-bold text-foreground">Editar Proyecto de Tesis</h1>
        <p className="text-muted-foreground text-sm mt-1">Actualiza la información del proyecto</p>
      </div>
      <ThesisForm
        initialData={project}
        title="Información del Proyecto"
        submitLabel="Guardar Cambios"
        onCancel={() => router.push('/dashboard/thesis')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
