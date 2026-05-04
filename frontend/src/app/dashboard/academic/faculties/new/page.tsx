'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { trpc } from '@/lib/trpc';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function NewFacultyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
  });
  const [loading, setLoading] = useState(false);

  const createMutation = trpc.academic.faculties.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.codigo.trim()) {
      toast({
        title: 'Error de validación',
        description: 'El nombre y código son requeridos',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createMutation.mutateAsync({
        nombre: formData.nombre,
        codigo: formData.codigo,
        descripcion: formData.descripcion || undefined,
        activo: true,
      });

      toast({
        title: 'Éxito',
        description: 'Facultad creada correctamente',
        duration: 3000,
      });

      router.push('/dashboard/academic/faculties');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo crear la facultad',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Nueva Facultad</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Crea una nueva facultad para la estructura académica
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
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            maxLength={1000}
            rows={4}
            disabled={loading}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Creando...' : 'Crear Facultad'}
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
