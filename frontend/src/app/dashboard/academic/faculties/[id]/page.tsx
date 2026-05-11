'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import Link from 'next/link';
import { ArrowLeft, Loader } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

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

interface Faculty {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
}

export default function EditFacultyPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Faculty | null>(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const facultyId = Number(params.id);

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        setDataLoading(true);
        const data = await fetchWithAuth(`/api/academic/faculties/${facultyId}`);
        setFormData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar facultad');
        toast({
          title: 'Error',
          description: 'No se pudo cargar la facultad',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (facultyId) {
      loadFaculty();
    }
  }, [facultyId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !formData.nombre.trim() || !formData.codigo.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre y código son requeridos',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await fetchWithAuth(`/api/academic/faculties/${facultyId}`, {
        method: 'PUT',
        body: JSON.stringify({
          nombre: formData.nombre,
          codigo: formData.codigo,
          descripcion: formData.descripcion || undefined,
        }),
      });

      toast({
        title: 'Éxito',
        description: 'Facultad actualizada correctamente',
      });

      router.push('/dashboard/academic/faculties');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la facultad',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading || !formData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin" />
          Cargando facultad...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link href="/dashboard/academic/faculties">
            <Button variant="outline" className="mt-4">
              Volver a facultades
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/academic/faculties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Facultad</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Actualiza los datos de la facultad
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            placeholder="Ej: Facultad de Ingeniería"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            maxLength={200}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            placeholder="Ej: FING"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })}
            maxLength={10}
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            placeholder="Descripción de la facultad..."
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            maxLength={1000}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Facultad'}
          </Button>
          <Link href="/dashboard/academic/faculties">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
