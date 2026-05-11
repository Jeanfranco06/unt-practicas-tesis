'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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

interface Payment {
  id: number;
  codigoPago: string;
  estudiante: {
    id: number;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email: string;
    };
    codigoUniversitario: string;
  };
  concepto: {
    id: number;
    nombre: string;
    tipo: string;
  };
  monto: number;
  estado: 'pendiente' | 'procesando' | 'completado' | 'rechazado' | 'reembolsado' | 'cancelado';
  metodoPago?: string;
  referenciaPago?: string;
  fechaPago: string | null;
  fechaVencimiento: string | null;
  comprobanteUrl?: string;
  observaciones?: string;
  registradoPorUsuario?: {
    nombre: string;
    apellidoPaterno: string;
  };
  aprobadoPorUsuario?: {
    nombre: string;
    apellidoPaterno: string;
  };
  fechaAprobacion: string | null;
  motivoRechazo?: string;
  creadoEn: string;
}

interface PaymentConcept {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  monto: number;
  activo: boolean;
}

export default function PaymentsPage() {
  const { hasAnyRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [concepts, setConcepts] = useState<PaymentConcept[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState({
    estado: '',
    busqueda: '',
    conceptoId: '',
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Authorization check - wait for auth to load
  useEffect(() => {
    if (authLoading) return;
    
    if (!hasAnyRole(['Secretaria', 'Administrador', 'Coordinador'])) {
      router.push('/dashboard');
      return;
    }
  }, [authLoading, hasAnyRole, router]);

  // Load concepts once
  useEffect(() => {
    if (authLoading) return;
    if (!hasAnyRole(['Secretaria', 'Administrador', 'Coordinador'])) return;
    
    loadConcepts();
  }, [authLoading]);

  // Load payments when page or filters change
  useEffect(() => {
    if (authLoading) return;
    if (!hasAnyRole(['Secretaria', 'Administrador', 'Coordinador'])) return;
    
    loadPayments();
  }, [page, filters, authLoading]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (filters.estado) queryParams.append('estado', filters.estado);
      if (filters.busqueda) queryParams.append('busqueda', filters.busqueda);
      if (filters.conceptoId) queryParams.append('conceptoId', parseInt(filters.conceptoId, 10).toString());
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const data = await fetchWithAuth(`/api/payments?${queryParams.toString()}`);
      setPayments(data.data || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar pagos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConcepts = async () => {
    try {
      const data = await fetchWithAuth('/api/payments/concepts?activo=true');
      setConcepts(data.data || []);
    } catch (error) {
      console.error('Error loading concepts:', error);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await fetchWithAuth(`/api/payments/${id}/approve`, { method: 'POST' });
      toast({
        title: 'Éxito',
        description: 'Pago aprobado correctamente',
      });
      loadPayments();
      setSelectedPayment(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al aprobar pago',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectReason.trim()) return;

    try {
      await fetchWithAuth(`/api/payments/${selectedPayment.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ motivo: rejectReason }),
      });
      toast({
        title: 'Éxito',
        description: 'Pago rechazado correctamente',
      });
      setIsRejectOpen(false);
      setRejectReason('');
      setSelectedPayment(null);
      loadPayments();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al rechazar pago',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, { color: string; label: string; icon: any }> = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente', icon: Clock },
      procesando: { color: 'bg-blue-100 text-blue-800', label: 'Procesando', icon: Clock },
      completado: { color: 'bg-green-100 text-green-800', label: 'Completado', icon: CheckCircle },
      rechazado: { color: 'bg-red-100 text-red-800', label: 'Rechazado', icon: XCircle },
      reembolsado: { color: 'bg-purple-100 text-purple-800', label: 'Reembolsado', icon: Download },
      cancelado: { color: 'bg-muted text-muted-foreground', label: 'Cancelado', icon: XCircle },
    };

    const variant = variants[estado] || variants.pendiente;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {variant.label}
      </Badge>
    );
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <ProtectedRoute>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Gestión de Pagos
              </h1>
              <p className="text-muted-foreground mt-1">
                Administre los pagos de estudiantes
              </p>
            </div>
            <Button onClick={() => router.push('/dashboard/payments/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Pago
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por código o estudiante..."
                    value={filters.busqueda}
                    onChange={(e) => setFilters({ ...filters, busqueda: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={filters.estado}
                onValueChange={(value) => setFilters({ ...filters, estado: value })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="procesando">Procesando</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.conceptoId}
                onValueChange={(value) => setFilters({ ...filters, conceptoId: value })}
              >
                <SelectTrigger className="w-[200px]">
                  <span className="block truncate">
                    {filters.conceptoId
                      ? concepts.find((c) => c.id.toString() === filters.conceptoId)?.nombre || 'Concepto'
                      : 'Concepto'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {concepts.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pagos Registrados ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No hay pagos registrados</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium">Código</th>
                        <th className="text-left py-3 px-4 font-medium">Estudiante</th>
                        <th className="text-left py-3 px-4 font-medium">Concepto</th>
                        <th className="text-left py-3 px-4 font-medium">Monto</th>
                        <th className="text-left py-3 px-4 font-medium">Estado</th>
                        <th className="text-left py-3 px-4 font-medium">Fecha</th>
                        <th className="text-right py-3 px-4 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{payment.codigoPago}</td>
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium">
                                {payment.estudiante?.usuario?.nombre} {payment.estudiante?.usuario?.apellidoPaterno}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {payment.estudiante?.codigoUniversitario}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">{payment.concepto?.nombre}</td>
                          <td className="py-3 px-4 font-medium">
                            S/ {Number(payment.monto).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">{getStatusBadge(payment.estado)}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {payment.fechaPago
                              ? new Date(payment.fechaPago).toLocaleDateString('es-ES')
                              : '-'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => router.push(`/dashboard/payments/${payment.id}`)}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Ver detalles
                                  </DropdownMenuItem>
                                  {payment.estado === 'pendiente' && hasAnyRole(['Secretaria', 'Administrador', 'Coordinador']) && (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => handleApprove(payment.id)}
                                        className="text-green-600"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Aprobar
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedPayment(payment);
                                          setIsRejectOpen(true);
                                        }}
                                        className="text-red-600"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Rechazar
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {payments.length} de {total} pagos
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Página {page} de {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Reject Dialog */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Pago</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Indique el motivo del rechazo del pago {selectedPayment?.codigoPago}
              </p>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="motivo">Motivo de rechazo *</Label>
              <textarea
                id="motivo"
                className="w-full mt-2 p-3 border border-input rounded-md min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                placeholder="Ingrese el motivo del rechazo..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleReject}
                disabled={!rejectReason.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar Pago
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </ProtectedRoute>
  );
}
