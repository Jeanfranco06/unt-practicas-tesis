'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { OfferForm } from '../../_components/OfferForm';
import { API_URL, fetchWithAuth } from '../../_lib/offers';
import type { Offer } from '../../_lib/offers';

export default function EditInternshipPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOffer = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`);
        setOffer(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar oferta');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadOffer();
  }, [id]);

  const handleUpdate = async (data: any) => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      toast({ title: 'Oferta actualizada', description: 'Los cambios fueron guardados exitosamente.' });
      router.push('/dashboard/internships');
      router.refresh();
    } catch (err: any) {
      toast({ title: 'Error al actualizar oferta', description: err.message || 'No se pudo actualizar la oferta.', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="text-slate-400">Cargando oferta...</div>;

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        <p>Error al cargar oferta: {error}</p>
      </div>
    );
  }

  if (!offer) return <div className="text-slate-400">Oferta no encontrada</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Editar Oferta</h1>
        <p className="text-slate-400 text-sm mt-1">Actualiza la información de la oferta de práctica</p>
      </div>
      <OfferForm
        title="Editar Oferta"
        submitLabel="Guardar cambios"
        initialData={offer}
        onCancel={() => router.push('/dashboard/internships')}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
