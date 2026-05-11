'use client';

import { useRouter } from 'next/navigation';
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

interface Faculty {
  id: number;
  nombre: string;
  codigo: string;
}

export default function NewCareerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    facultadId: '',
    nombre: '',
    codigo: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadFaculties = async () => {
      try {
        setDataLoading(true);
        const data = await fetchWithAuth('/api/academic/faculties');
        setFaculties(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, facultadId: String(data[0].id) }));
        }
      } catch (err) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar las facultades',
          variant: 'destructive',
        });
      } finally {
        setDataLoading(false);
      }
    };

    loadFaculties();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.facultadId || !formData.nombre.trim() || !formData.codigo.trim()) {
      toast({
        title: 'Error de validación',
        description: 'La facultad, nombre y código son requeridos',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await fetchWithAuth('/api/academic/careers', {
        method: 'POST',
        body: JSON.stringify({
          facultadId: Number(formData.facultadId),
          nombre: formData.nombre,
          codigo: formData.codigo,
          descripcion: formData.descripcion || undefined,
          activo: true,
        }),
      });

      toast({
        title: 'Éxito',
        description: 'Carrera creada correctamente',
      });

      router.push('/dashboard/academic/careers');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo crear la carrera',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader className="w-4 h-4 animate-spin" />
          Cargando facultades...
        </div>
      </div>
    );
  }

  if (faculties.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground font-medium">No hay facultades registradas</p>
          <p className="text-sm text-muted-foreground mb-4">Debes crear una facultad primero</p>
          <Link href="/dashboard/academic/faculties/new">
            <Button>Crear Facultad</Button>
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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Carrera</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea una nueva carrera académica
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-lg p-6">
        <div className="space-y-2">
          <Label htmlFor="facultad">Facultad *</Label>
          <Select
            value={formData.facultadId}
            onValueChange={(value) => setFormData({ ...formData, facultadId: value })}
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
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            maxLength={1000}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Carrera'}
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
