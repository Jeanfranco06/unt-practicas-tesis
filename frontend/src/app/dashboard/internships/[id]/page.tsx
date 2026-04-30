'use client';

import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function InternshipDetailPage() {
  const { id } = useParams();
  const { data: offer, refetch } = trpc.internships.getOffer.useQuery({ id: Number(id) });
  const applyMutation = trpc.internships.apply.useMutation();
  const { toast } = useToast();

  const handleApply = async () => {
    try {
      await applyMutation.mutateAsync({ ofertaId: Number(id) });
      toast({ title: 'Postulación exitosa', description: 'Tu postulación ha sido registrada' });
      refetch();
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo postular', variant: 'destructive' });
    }
  };

  if (!offer) return <div>Cargando...</div>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{offer.titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Empresa:</strong> {offer.empresa.razonSocial}</p>
          <p><strong>Requisitos:</strong> {offer.requisitos}</p>
          <p><strong>Período postulación:</strong> {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}</p>
          <p><strong>Práctica:</strong> {new Date(offer.fechaInicioPractica).toLocaleDateString()} al {new Date(offer.fechaFinPractica).toLocaleDateString()}</p>
          <p><strong>Cupos:</strong> {offer.cupos}</p>
          <Button onClick={handleApply} disabled={applyMutation.isLoading}>Postularme</Button>
        </CardContent>
      </Card>
    </div>
  );
}