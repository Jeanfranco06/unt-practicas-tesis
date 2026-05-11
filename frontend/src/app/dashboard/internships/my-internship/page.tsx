'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoursTrackingForm } from '@/components/forms/HoursTrackingForm';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {}
    throw new Error(message);
  }

  return res.json();
}

interface Internship {
  id: number;
  empresa?: { razonSocial: string };
  asesorAcademico?: { nombre: string };
  horasCompletadas: number;
  horasTotalesRequeridas: number;
}

export default function MyInternshipPage() {
  const { role, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [internshipLoading, setInternshipLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && role && role !== 'Estudiante') {
      router.push('/dashboard');
    }
  }, [role, authLoading, router]);

  useEffect(() => {
    const loadInternship = async () => {
      if (role !== 'Estudiante') return;
      try {
        setInternshipLoading(true);
        const data = await fetchWithAuth('/api/internships/my-internship');
        setInternship(data);
      } catch (err) {
        // Silenciar error si no tiene práctica
        setInternship(null);
      } finally {
        setInternshipLoading(false);
      }
    };

    if (role === 'Estudiante') {
      loadInternship();
    }
  }, [role]);

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
