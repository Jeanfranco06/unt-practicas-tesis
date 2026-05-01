'use client';

import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { OfferForm } from '../_components/OfferForm';
import { API_URL, fetchWithAuth } from '../_lib/offers';

export default function NewInternshipPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleCreate = async (data: any) => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast({ title: 'Oferta creada', description: 'La oferta fue registrada exitosamente.' });
      router.push('/dashboard/internships');
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Error al crear oferta', description: err.message || 'No se pudo crear la oferta.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Nueva Oferta</h1>
        <p className="text-slate-400 text-sm mt-1">Registra una nueva oferta de práctica preprofesional</p>
      </div>
      <OfferForm
        title="Nueva Oferta"
        submitLabel="Crear oferta"
        onCancel={() => router.push('/dashboard/internships')}
        onSubmit={handleCreate}
      />
    </div>
  );
}
