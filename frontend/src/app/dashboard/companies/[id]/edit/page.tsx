'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { CompanyForm } from '../../_components/CompanyForm';
import { API_URL, fetchWithAuth, normalizeCompanyFormData } from '../../_lib/companies';
import type { Company } from '../../_lib/companies';

export default function EditCompanyPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/companies/${id}`);
        setCompany(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadCompany();
  }, [id]);

  const handleSubmit = async (data: ReturnType<typeof normalizeCompanyFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/companies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Empresa actualizada exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/companies');
    } catch (err: any) {
      toast({
        title: 'Error al actualizar empresa',
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
        <p>Error al cargar empresa: {error}</p>
        <button
          onClick={() => router.push('/dashboard/companies')}
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
        <h1 className="text-2xl font-bold text-foreground">Editar Empresa</h1>
        <p className="text-muted-foreground text-sm mt-1">Actualiza la información de la empresa</p>
      </div>
      <CompanyForm
        initialData={company}
        title="Información de la Empresa"
        submitLabel="Guardar Cambios"
        onCancel={() => router.push('/dashboard/companies')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
