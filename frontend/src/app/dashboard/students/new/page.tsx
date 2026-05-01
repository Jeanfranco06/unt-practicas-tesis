'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { StudentForm } from '../_components/StudentForm';
import { API_URL, fetchWithAuth, normalizeStudentFormData } from '../_lib/students';

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ReturnType<typeof normalizeStudentFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/students`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Estudiante creado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/students');
    } catch (err: any) {
      toast({
        title: 'Error al crear estudiante',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Estudiante</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra un nuevo estudiante en el sistema</p>
      </div>
      <StudentForm
        title="Información del Estudiante"
        submitLabel="Crear Estudiante"
        onCancel={() => router.push('/dashboard/students')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
