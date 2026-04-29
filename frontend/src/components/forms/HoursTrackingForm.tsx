'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trpc } from '@/lib/trpc/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const schema = z.object({
  fechaTrabajada: z.string().min(1),
  horas: z.number().min(1).max(12),
  descripcionActividad: z.string().min(5),
  evidenciaUrl: z.string().url().optional(),
});

export function HoursTrackingForm({ internshipId }: { internshipId: number }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });
  const { toast } = useToast();
  const addHours = trpc.internships.addHoursTracking.useMutation({
    onSuccess: () => {
      toast({ title: 'Horas registradas', description: 'Espera la aprobación' });
      reset();
    },
  });

  const onSubmit = (data: any) => {
    addHours.mutate({ ...data, practicaId: internshipId, horas: Number(data.horas) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Horas</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Fecha</Label>
            <Input type="date" {...register('fechaTrabajada')} />
            {errors.fechaTrabajada && <p className="text-red-500">{errors.fechaTrabajada.message}</p>}
          </div>
          <div>
            <Label>Horas</Label>
            <Input type="number" {...register('horas', { valueAsNumber: true })} />
            {errors.horas && <p className="text-red-500">{errors.horas.message}</p>}
          </div>
          <div>
            <Label>Descripción</Label>
            <Textarea {...register('descripcionActividad')} />
            {errors.descripcionActividad && <p className="text-red-500">{errors.descripcionActividad.message}</p>}
          </div>
          <div>
            <Label>URL Evidencia (opcional)</Label>
            <Input {...register('evidenciaUrl')} />
          </div>
          <Button type="submit" disabled={addHours.isLoading}>Registrar</Button>
        </form>
      </CardContent>
    </Card>
  );
}