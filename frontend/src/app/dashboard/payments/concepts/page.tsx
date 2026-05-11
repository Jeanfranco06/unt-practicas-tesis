'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Plus,
  Search,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Save,
  X,
  FileText,
  DollarSign,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface PaymentConcept {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  monto: number;
  tipo: 'matricula' | 'tramite' | 'otro';
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

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

export default function PaymentConceptsPage() {
  const router = useRouter();
  const { hasAnyRole } = useAuth();
  const { toast } = useToast();

  const [concepts, setConcepts] = useState<PaymentConcept[]>([]);
  const [filteredConcepts, setFilteredConcepts] = useState<PaymentConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConcept, setEditingConcept] = useState<PaymentConcept | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    monto: '',
    tipo: 'otro' as 'matricula' | 'tramite' | 'otro',
    activo: true,
  });

  // Check permissions
  const canManageConcepts = hasAnyRole(['Secretaria', 'Administrador', 'Coordinador']);

  useEffect(() => {
    loadConcepts();
  }, []);

  useEffect(() => {
    filterConcepts();
  }, [concepts, searchTerm, showInactive]);

  const loadConcepts = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/payments/concepts');
      setConcepts(data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar conceptos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterConcepts = () => {
    let filtered = concepts;

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.codigo.toLowerCase().includes(term) ||
          c.descripcion?.toLowerCase().includes(term)
      );
    }

    // Filter by active status
    if (!showInactive) {
      filtered = filtered.filter((c) => c.activo);
    }

    setFilteredConcepts(filtered);
  };

  const openCreateModal = () => {
    setEditingConcept(null);
    setFormData({
      codigo: '',
      nombre: '',
      descripcion: '',
      monto: '',
      tipo: 'otro',
      activo: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (concept: PaymentConcept) => {
    setEditingConcept(concept);
    setFormData({
      codigo: concept.codigo,
      nombre: concept.nombre,
      descripcion: concept.descripcion || '',
      monto: concept.monto.toString(),
      tipo: concept.tipo,
      activo: concept.activo,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.codigo || !formData.nombre || !formData.monto) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        ...formData,
        monto: parseFloat(formData.monto),
      };

      if (editingConcept) {
        await fetchWithAuth(`/api/payments/concepts/${editingConcept.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Éxito', description: 'Concepto actualizado correctamente' });
      } else {
        await fetchWithAuth('/api/payments/concepts', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({ title: 'Éxito', description: 'Concepto creado correctamente' });
      }

      setIsModalOpen(false);
      loadConcepts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al guardar concepto',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este concepto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await fetchWithAuth(`/api/payments/concepts/${id}`, { method: 'DELETE' });
      toast({ title: 'Éxito', description: 'Concepto eliminado correctamente' });
      loadConcepts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al eliminar concepto',
        variant: 'destructive',
      });
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      matricula: 'Matrícula',
      tramite: 'Trámite',
      otro: 'Otro',
    };
    return labels[tipo] || tipo;
  };

  const getTipoBadge = (tipo: string) => {
    const colors: Record<string, string> = {
      matricula: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      tramite: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      otro: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
    };
    return colors[tipo] || colors.otro;
  };

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard/payments')}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Conceptos de Pago
                </h1>
                <p className="text-muted-foreground mt-1">
                  Gestione los conceptos disponibles para pagos
                </p>
              </div>
            </div>
            {canManageConcepts && (
              <Button onClick={openCreateModal}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Concepto
              </Button>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Conceptos</p>
                  <p className="text-2xl font-bold">{concepts.length}</p>
                </div>
                <Wallet className="w-8 h-8 text-primary/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {concepts.filter((c) => c.activo).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500/60" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-500">
                    {concepts.filter((c) => !c.activo).length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-gray-400/60" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código, nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    Mostrar inactivos
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Concepts List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Listado de Conceptos</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : filteredConcepts.length === 0 ? (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {searchTerm
                      ? 'No se encontraron conceptos con ese criterio'
                      : 'No hay conceptos de pago registrados'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Código</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Monto</th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">Estado</th>
                        <th className="text-right py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredConcepts.map((concept) => (
                        <tr key={concept.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4 font-mono text-sm">{concept.codigo}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">{concept.nombre}</p>
                              {concept.descripcion && (
                                <p className="text-sm text-muted-foreground">{concept.descripcion}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getTipoBadge(concept.tipo)}>
                              {getTipoLabel(concept.tipo)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-medium">
                            S/ {Number(concept.monto).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            {concept.activo ? (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                Activo
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Inactivo</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {canManageConcepts && (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditModal(concept)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(concept.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Create/Edit Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingConcept ? 'Editar Concepto' : 'Nuevo Concepto de Pago'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ej: MAT-2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo">Tipo *</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({ ...formData, tipo: e.target.value as 'matricula' | 'tramite' | 'otro' })
                    }
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    required
                  >
                    <option value="matricula">Matrícula</option>
                    <option value="tramite">Trámite</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Matrícula 2024-I"
                  required
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Descripción opcional del concepto"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monto">Monto (S/) *</Label>
                  <Input
                    id="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="activo"
                    checked={formData.activo}
                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="activo" className="cursor-pointer">
                    Concepto activo
                  </Label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Guardando...' : editingConcept ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
