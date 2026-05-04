'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { CompanyForm } from '../_components/CompanyForm';
import { API_URL, fetchWithAuth, normalizeCompanyFormData } from '../_lib/companies';

export default function NewCompanyPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ReturnType<typeof normalizeCompanyFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/companies`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Empresa creada exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/companies');
    } catch (err: any) {
      toast({
        title: 'Error al crear empresa',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nueva Empresa</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra una nueva empresa en el sistema</p>
        <p className="text-muted-foreground text-xs mt-2">
          ¿Necesitas validar o generar un RUC?{' '}
          <a href="/dashboard/companies/ruc-tool" className="text-blue-500 hover:underline">
            Usa la herramienta de RUC
          </a>
        </p>
      </div>
      <CompanyForm
        title="Información de la Empresa"
        submitLabel="Crear Empresa"
        onCancel={() => router.push('/dashboard/companies')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
