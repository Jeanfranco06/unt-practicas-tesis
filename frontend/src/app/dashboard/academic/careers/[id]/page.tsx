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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface Career {
  id: number;
  nombre: string;
  codigo: string;
  descripcion?: string;
  activo: boolean;
  facultadId: number;
}

interface Faculty {
  id: number;
  nombre: string;
  codigo: string;
}

export default function EditCareerPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Career | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const careerId = Number(params.id);

  useEffect(() => {
    const loadData = async () => {
      try {
        setDataLoading(true);
        const [careerData, facultiesData] = await Promise.all([
          fetchWithAuth(`/api/academic/careers/${careerId}`),
          fetchWithAuth('/api/academic/faculties'),
        ]);
        setFormData(careerData);
        setFaculties(facultiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar datos');
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los datos',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    if (careerId) {
      loadData();
    }
  }, [careerId, toast]);

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
      await fetchWithAuth(`/api/academic/careers/${careerId}`, {
        method: 'PUT',
        body: JSON.stringify({
          facultadId: formData.facultadId,
          nombre: formData.nombre,
          codigo: formData.codigo,
          descripcion: formData.descripcion || undefined,
        }),
      });

      toast({
        title: 'Éxito',
        description: 'Carrera actualizada correctamente',
      });

      router.push('/dashboard/academic/careers');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo actualizar la carrera',
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
          Cargando carrera...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <Link href="/dashboard/academic/careers">
            <Button variant="outline" className="mt-4">
              Volver a carreras
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
        <Link href="/dashboard/academic/careers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Carrera</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Actualiza los datos de la carrera
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
        <div className="space-y-2">
          <Label htmlFor="facultad">Facultad *</Label>
          <Select
            value={String(formData.facultadId)}
            onValueChange={(value) => setFormData({ ...formData, facultadId: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona una facultad" />
            </SelectTrigger>
            <SelectContent>
              {faculties.map((faculty) => (
                <SelectItem key={faculty.id} value={String(faculty.id)}>
                  {faculty.nombre} ({faculty.codigo})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            placeholder="Ej: Ingeniería Civil"
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
            placeholder="Ej: IC"
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
            placeholder="Descripción de la carrera..."
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            maxLength={1000}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar Carrera'}
          </Button>
          <Link href="/dashboard/academic/careers">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
