'use client';

import { trpc } from '@/lib/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoursTrackingForm } from '@/components/forms/HoursTrackingForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyInternshipPage() {
  const { role, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Only students should access this page
  const { data: internship, isLoading: internshipLoading } = trpc.internships.getMyInternship.useQuery(undefined, {
    enabled: role === 'Estudiante',
  });

  useEffect(() => {
    if (!authLoading && role && role !== 'Estudiante') {
      router.push('/dashboard');
    }
  }, [role, authLoading, router]);

  if (authLoading || internshipLoading) {
    return <div className="text-muted-foreground">Cargando...</div>;
  }

  if (role !== 'Estudiante') {
    return null;
  }

  if (!internship) return <div className="text-muted-foreground">No tienes una práctica activa</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Práctica</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">Empresa: {internship.empresa ? internship.empresa.razonSocial : 'No especificada'}</p>
          <p className="text-foreground">Asesor académico: {internship.asesorAcademico?.nombre}</p>
          <p className="text-foreground">Horas completadas: {internship.horasCompletadas} / {internship.horasTotalesRequeridas}</p>
          <div className="w-full bg-muted rounded-full h-2.5 mt-2">
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${(internship.horasCompletadas / internship.horasTotalesRequeridas) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>
      <HoursTrackingForm internshipId={internship.id} />
    </div>
  );
}
