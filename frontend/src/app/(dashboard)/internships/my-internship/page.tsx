'use client';

import { trpc } from '@/lib/trpc/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoursTrackingForm } from '@/components/forms/HoursTrackingForm';

export default function MyInternshipPage() {
  const { data: internship } = trpc.internships.getMyInternship.useQuery();

  if (!internship) return <div>No tienes una práctica activa</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mi Práctica</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Empresa: {internship.empresa.razonSocial}</p>
          <p>Asesor académico: {internship.asesorAcademico?.nombre}</p>
          <p>Horas completadas: {internship.horasCompletadas} / {internship.horasTotalesRequeridas}</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(internship.horasCompletadas / internship.horasTotalesRequeridas) * 100}%` }}></div>
          </div>
        </CardContent>
      </Card>
      <HoursTrackingForm internshipId={internship.id} />
    </div>
  );
}