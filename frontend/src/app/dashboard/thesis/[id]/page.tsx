'use client';
import { useParams } from 'next/navigation';
import { trpc } from '@/lib/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ThesisDetailPage() {
  const { id } = useParams();
  const { data: project } = trpc.thesis.getProject.useQuery({ id: Number(id) });
  const submitMutation = trpc.thesis.submitDeliverable.useMutation();

  if (!project) return <div>Cargando...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>{project.titulo}</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Resumen:</strong> {project.resumen}</p>
          <p><strong>Área:</strong> {project.areaConocimiento}</p>
          <p><strong>Estado:</strong> {project.estado}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Entregables</CardTitle></CardHeader>
        <CardContent>
          {project.entregables?.map((del: any) => (
            <div key={del.id} className="border p-4 mb-2 rounded">
              <p><strong>{del.nombre}</strong> - Límite: {new Date(del.fechaLimite).toLocaleDateString()}</p>
              <Button
                onClick={() => submitMutation.mutate({ entregableId: del.id, tituloEntrega: 'Mi entrega', documentoUrl: 'http://...' })}
                disabled={submitMutation.isLoading}
              >
                Entregar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}