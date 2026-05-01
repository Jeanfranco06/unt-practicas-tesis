'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { ThesisForm } from '../_components/ThesisForm';
import { API_URL, fetchWithAuth, normalizeThesisFormData } from '../_lib/thesis';

export default function NewThesisPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ReturnType<typeof normalizeThesisFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/thesis/projects`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Proyecto de tesis creado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/thesis');
    } catch (err: any) {
      toast({
        title: 'Error al crear proyecto',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Proyecto de Tesis</h1>
        <p className="text-muted-foreground text-sm mt-1">Crea un nuevo proyecto de tesis para un estudiante</p>
      </div>
      <ThesisForm
        title="Información del Proyecto"
        submitLabel="Crear Proyecto"
        onCancel={() => router.push('/dashboard/thesis')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
