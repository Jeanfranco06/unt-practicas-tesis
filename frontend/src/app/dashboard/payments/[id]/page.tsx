'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import {
  CreditCard,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  User,
  FileText,
  Calendar,
  DollarSign,
  Building,
  Edit,
  Printer,
  History,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Payment {
  id: number;
  codigoPago: string;
  estudianteId: number;
  estudiante: {
    id: number;
    usuario: {
      id: number;
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email: string;
      dni?: string;
    };
    codigoUniversitario: string;
    facultad?: string;
    escuela?: string;
  };
  conceptoId: number;
  concepto: {
    id: number;
    codigo: string;
    nombre: string;
    descripcion?: string;
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
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
  };
  registradoPor?: number;
  aprobadoPorUsuario?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
  };
  aprobadoPor?: number;
  fechaAprobacion: string | null;
  fechaRechazo: string | null;
  motivoRechazo?: string;
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

export default function PaymentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, hasRole, hasAnyRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Verificar permisos (se evalúan después de que auth cargue)
  const canViewPayment = hasAnyRole(['Secretaria', 'Administrador', 'Coordinador', 'Estudiante']);
  const canManagePayment = hasAnyRole(['Secretaria', 'Administrador', 'Coordinador']);
  const canApproveReject = hasAnyRole(['Secretaria', 'Administrador', 'Coordinador']);
  const isSecretary = hasRole('Secretaria');
  const isAdmin = hasRole('Administrador');
  const isCoordinator = hasRole('Coordinador');

  useEffect(() => {
    // Esperar a que el auth termine de cargar
    if (authLoading) return;

    // Verificar permisos solo después de que auth haya cargado
    if (!canViewPayment) {
      router.push('/dashboard');
      return;
    }
    loadPayment();
  }, [id, authLoading, canViewPayment]);

  const loadPayment = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`/api/payments/${id}`);
      setPayment(data.data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar el pago',
        variant: 'destructive',
      });
      router.push('/dashboard/payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!payment) return;
    
    try {
      setIsProcessing(true);
      await fetchWithAuth(`/api/payments/${payment.id}/approve`, { method: 'POST' });
      toast({
        title: 'Éxito',
        description: 'Pago aprobado correctamente',
      });
      loadPayment();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al aprobar pago',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!payment || !rejectReason.trim()) return;

    try {
      setIsProcessing(true);
      await fetchWithAuth(`/api/payments/${payment.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ motivo: rejectReason }),
      });
      toast({
        title: 'Éxito',
        description: 'Pago rechazado correctamente',
      });
      setIsRejectOpen(false);
      setRejectReason('');
      loadPayment();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al rechazar pago',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, { color: string; label: string; icon: any }> = {
      pendiente: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', label: 'Pendiente', icon: Clock },
      procesando: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', label: 'Procesando', icon: Clock },
      completado: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', label: 'Completado', icon: CheckCircle },
      rechazado: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', label: 'Rechazado', icon: XCircle },
      reembolsado: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400', label: 'Reembolsado', icon: Download },
      cancelado: { color: 'bg-muted text-muted-foreground', label: 'Cancelado', icon: XCircle },
    };

    const variant = variants[estado] || variants.pendiente;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} flex items-center gap-1 px-3 py-1`}>
        <Icon className="w-4 h-4" />
        {variant.label}
      </Badge>
    );
  };

  const getMetodoPagoLabel = (metodo?: string) => {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      deposito: 'Depósito',
      transferencia: 'Transferencia',
      tarjeta: 'Tarjeta',
      yape: 'Yape',
      plin: 'Plin',
      otro: 'Otro',
    };
    return metodo ? labels[metodo] || metodo : 'No especificado';
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!payment) {
    return (
      <ProtectedRoute>
        <div className="p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Pago no encontrado</p>
              <Button onClick={() => router.push('/dashboard/payments')} className="mt-4">
                Volver a la lista
              </Button>
            </CardContent>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const isPending = payment.estado === 'pendiente';
  const canTakeAction = canApproveReject && isPending;

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
                  Pago {payment.codigoPago}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Detalle completo del pago
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              {canTakeAction && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRejectOpen(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button size="sm" onClick={handleApprove} disabled={isProcessing}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isProcessing ? 'Procesando...' : 'Aprobar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-l-4 border-l-primary">
            <CardContent className="py-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  {getStatusBadge(payment.estado)}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Registrado: {new Date(payment.creadoEn).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  {payment.fechaAprobacion && (
                    <span className="text-muted-foreground">
                      Aprobado: {new Date(payment.fechaAprobacion).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'long', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5" />
                  Información del Estudiante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Nombre completo</Label>
                    <p className="font-medium text-lg">
                      {payment.estudiante.usuario.nombre} {payment.estudiante.usuario.apellidoPaterno} {payment.estudiante.usuario.apellidoMaterno}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Código Universitario</Label>
                    <p className="font-medium text-lg">{payment.estudiante.codigoUniversitario}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Email</Label>
                    <p className="font-medium">{payment.estudiante.usuario.email}</p>
                  </div>
                  {payment.estudiante.usuario.dni && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">DNI</Label>
                      <p className="font-medium">{payment.estudiante.usuario.dni}</p>
                    </div>
                  )}
                  {payment.estudiante.facultad && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Facultad</Label>
                      <p className="font-medium">{payment.estudiante.facultad}</p>
                    </div>
                  )}
                  {payment.estudiante.escuela && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Escuela</Label>
                      <p className="font-medium">{payment.estudiante.escuela}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5" />
                  Detalles del Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Concepto</Label>
                    <p className="font-medium text-lg">{payment.concepto.nombre}</p>
                    {payment.concepto.descripcion && (
                      <p className="text-sm text-muted-foreground mt-1">{payment.concepto.descripcion}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Tipo</Label>
                    <p className="font-medium capitalize">{payment.concepto.tipo}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Monto</Label>
                    <p className="font-bold text-2xl text-primary">
                      S/ {Number(payment.monto).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-xs uppercase tracking-wide">Método de Pago</Label>
                    <p className="font-medium flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {getMetodoPagoLabel(payment.metodoPago)}
                    </p>
                  </div>
                  {payment.referenciaPago && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Referencia / N° Operación</Label>
                      <p className="font-medium font-mono bg-muted px-2 py-1 rounded inline-block">
                        {payment.referenciaPago}
                      </p>
                    </div>
                  )}
                  {payment.fechaPago && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Fecha de Pago</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.fechaPago).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  {payment.fechaVencimiento && (
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Fecha de Vencimiento</Label>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(payment.fechaVencimiento).toLocaleDateString('es-ES', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {payment.observaciones && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Observaciones</Label>
                      <p className="mt-1 p-3 bg-muted/50 rounded-md text-sm">{payment.observaciones}</p>
                    </div>
                  </>
                )}

                {payment.motivoRechazo && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-red-500 text-xs uppercase tracking-wide flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Motivo de Rechazo
                      </Label>
                      <p className="mt-1 p-3 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-md text-sm">
                        {payment.motivoRechazo}
                      </p>
                    </div>
                  </>
                )}

                {payment.comprobanteUrl && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Comprobante</Label>
                      <div className="mt-2">
                        <a
                          href={payment.comprobanteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-primary hover:underline"
                        >
                          <FileText className="w-4 h-4" />
                          Ver comprobante adjunto
                        </a>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Audit Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="w-5 h-5" />
                  Registro de Auditoría
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Registrado por</Label>
                  {payment.registradoPorUsuario ? (
                    <div className="mt-1">
                      <p className="font-medium">
                        {payment.registradoPorUsuario.nombre} {payment.registradoPorUsuario.apellidoPaterno}
                      </p>
                      <p className="text-sm text-muted-foreground">{payment.registradoPorUsuario.email}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Sistema automático</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(payment.creadoEn).toLocaleString('es-ES')}
                  </p>
                </div>

                {payment.aprobadoPorUsuario && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Aprobado por</Label>
                      <div className="mt-1">
                        <p className="font-medium text-green-600 dark:text-green-400">
                          {payment.aprobadoPorUsuario.nombre} {payment.aprobadoPorUsuario.apellidoPaterno}
                        </p>
                        <p className="text-sm text-muted-foreground">{payment.aprobadoPorUsuario.email}</p>
                      </div>
                      {payment.fechaAprobacion && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(payment.fechaAprobacion).toLocaleString('es-ES')}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {payment.fechaRechazo && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-muted-foreground text-xs uppercase tracking-wide">Rechazado</Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(payment.fechaRechazo).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </>
                )}

                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs uppercase tracking-wide">Última actualización</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(payment.actualizadoEn).toLocaleString('es-ES')}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions for Secretary */}
            {isSecretary && isPending && (
              <Card className="border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="text-sm">Acciones de Secretaría</CardTitle>
                  <CardDescription>
                    Este pago está pendiente de tu revisión
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    className="w-full" 
                    onClick={handleApprove}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Pago
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => setIsRejectOpen(true)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar Pago
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Help Card for Student */}
            {!canManagePayment && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">¿Necesitas ayuda?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Si tienes alguna consulta sobre este pago, contacta a secretaría:
                  </p>
                  <p className="font-medium">secretaria@unt.edu.pe</p>
                  <p className="text-muted-foreground">Horario: L-V 8:00am - 5:00pm</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>

        {/* Reject Dialog */}
        <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rechazar Pago</DialogTitle>
              <p className="text-sm text-muted-foreground">
                Indique el motivo del rechazo del pago {payment.codigoPago}
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
                disabled={!rejectReason.trim() || isProcessing}
                className="bg-red-600 hover:bg-red-700"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isProcessing ? 'Procesando...' : 'Rechazar Pago'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
