'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  ArrowLeft,
  Plus,
  Save,
  X,
  User,
  FileText,
  DollarSign,
  Building,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Student {
  id: number;
  codigoUniversitario: string;
  usuario: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
  };
  facultad?: string;
  escuela?: string;
}

interface PaymentConcept {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  monto: number;
  tipo: string;
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

export default function NewPaymentPage() {
  const router = useRouter();
  const { hasAnyRole, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [students, setStudents] = useState<Student[]>([]);
  const [concepts, setConcepts] = useState<PaymentConcept[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingConcepts, setLoadingConcepts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    estudianteId: '',
    conceptoId: '',
    monto: '',
    metodoPago: '',
    referenciaPago: '',
    observaciones: '',
  });

  // Check permissions
  const canCreatePayment = hasAnyRole(['Secretaria', 'Administrador', 'Coordinador']);

  useEffect(() => {
    if (authLoading) return;

    if (!canCreatePayment) {
      router.push('/dashboard');
      return;
    }

    loadStudents();
    loadConcepts();
  }, [authLoading, canCreatePayment]);

  const loadStudents = async () => {
    try {
      setLoadingStudents(true);
      const data = await fetchWithAuth('/api/students');
      setStudents(Array.isArray(data) ? data : data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar estudiantes',
        variant: 'destructive',
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadConcepts = async () => {
    try {
      setLoadingConcepts(true);
      const data = await fetchWithAuth('/api/payments/concepts?activo=true');
      setConcepts(data.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cargar conceptos',
        variant: 'destructive',
      });
    } finally {
      setLoadingConcepts(false);
    }
  };

  const handleConceptChange = (value: string) => {
    const concept = concepts.find((c) => c.id.toString() === value);
    setFormData((prev) => ({
      ...prev,
      conceptoId: value,
      monto: concept ? concept.monto.toString() : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!formData.estudianteId || !formData.conceptoId || !formData.monto) {
      toast({
        title: 'Error',
        description: 'Complete todos los campos requeridos (Estudiante, Concepto, Monto)',
        variant: 'destructive',
      });
      return;
    }

    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) {
      toast({
        title: 'Error',
        description: 'El monto debe ser un número válido mayor a 0',
        variant: 'destructive',
      });
      return;
    }

    const estudianteId = parseInt(formData.estudianteId, 10);
    const conceptoId = parseInt(formData.conceptoId, 10);

    if (isNaN(estudianteId) || isNaN(conceptoId)) {
      toast({
        title: 'Error',
        description: 'Estudiante y concepto son requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await fetchWithAuth('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          estudianteId,
          conceptoId,
          monto,
          metodoPago: formData.metodoPago || undefined,
          referenciaPago: formData.referenciaPago || undefined,
          observaciones: formData.observaciones || undefined,
        }),
      });

      toast({
        title: 'Éxito',
        description: 'Pago registrado correctamente',
      });

      // Navigate back to payments list
      router.push('/dashboard/payments');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al registrar pago',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedStudent = () => {
    return students.find((s) => s.id.toString() === formData.estudianteId);
  };

  const getSelectedConcept = () => {
    return concepts.find((c) => c.id.toString() === formData.conceptoId);
  };

  if (authLoading) {
    return (
      <ProtectedRoute>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-4xl mx-auto">
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
                  Registrar Nuevo Pago
                </h1>
                <p className="text-muted-foreground mt-1">
                  Complete los datos para registrar un pago de estudiante
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Student Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <User className="w-5 h-5" />
                    Estudiante
                  </CardTitle>
                  <CardDescription>
                    Seleccione el estudiante que realiza el pago
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="estudianteId">Estudiante *</Label>
                      <Select
                        value={formData.estudianteId}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, estudianteId: value }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue
                            placeholder={
                              loadingStudents ? 'Cargando...' : 'Seleccione un estudiante'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {student.usuario.nombre} {student.usuario.apellidoPaterno}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {student.codigoUniversitario} - {student.usuario.email}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {getSelectedStudent() && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">Información del Estudiante</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Código:</span>
                            <p className="font-medium">
                              {getSelectedStudent()?.codigoUniversitario}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Email:</span>
                            <p className="font-medium">{getSelectedStudent()?.usuario.email}</p>
                          </div>
                          {getSelectedStudent()?.facultad && (
                            <div>
                              <span className="text-muted-foreground">Facultad:</span>
                              <p className="font-medium">{getSelectedStudent()?.facultad}</p>
                            </div>
                          )}
                          {getSelectedStudent()?.escuela && (
                            <div>
                              <span className="text-muted-foreground">Escuela:</span>
                              <p className="font-medium">{getSelectedStudent()?.escuela}</p>
                            </div>
                          )}
                        </div>
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
                  <CardDescription>
                    Seleccione el concepto y complete los detalles del pago
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="conceptoId">Concepto de Pago *</Label>
                      <Select
                        value={formData.conceptoId}
                        onValueChange={handleConceptChange}
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue
                            placeholder={
                              loadingConcepts ? 'Cargando...' : 'Seleccione un concepto'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="max-h-72">
                          {concepts.map((concept) => (
                            <SelectItem key={concept.id} value={concept.id.toString()}>
                              <div className="flex flex-col">
                                <span className="font-medium">{concept.nombre}</span>
                                <span className="text-xs text-muted-foreground">
                                  S/ {Number(concept.monto).toFixed(2)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="monto">Monto (S/) *</Label>
                      <div className="relative mt-1.5">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="monto"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.monto}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, monto: e.target.value }))
                          }
                          placeholder="0.00"
                          className="pl-9"
                          required
                        />
                      </div>
                      {getSelectedConcept() && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Monto sugerido: S/ {Number(getSelectedConcept()?.monto).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="metodoPago">Método de Pago</Label>
                      <Select
                        value={formData.metodoPago}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, metodoPago: value }))
                        }
                      >
                        <SelectTrigger className="mt-1.5">
                          <SelectValue placeholder="Seleccione método (opcional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="efectivo">Efectivo</SelectItem>
                          <SelectItem value="deposito">Depósito</SelectItem>
                          <SelectItem value="transferencia">Transferencia</SelectItem>
                          <SelectItem value="tarjeta">Tarjeta</SelectItem>
                          <SelectItem value="yape">Yape</SelectItem>
                          <SelectItem value="plin">Plin</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="referencia">Referencia / N° Operación</Label>
                      <Input
                        id="referencia"
                        value={formData.referenciaPago}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, referenciaPago: e.target.value }))
                        }
                        placeholder="Número de voucher, operación, etc."
                        className="mt-1.5"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observaciones">Observaciones</Label>
                    <textarea
                      id="observaciones"
                      className="w-full mt-1.5 p-3 border border-input rounded-md min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                      value={formData.observaciones}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, observaciones: e.target.value }))
                      }
                      placeholder="Observaciones adicionales sobre el pago..."
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <Card className="border-primary/20">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-sm">Resumen del Pago</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Estudiante
                    </p>
                    <p className="font-medium">
                      {getSelectedStudent()
                        ? `${getSelectedStudent()?.usuario.nombre} ${getSelectedStudent()?.usuario.apellidoPaterno}`
                        : 'No seleccionado'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      Concepto
                    </p>
                    <p className="font-medium">
                      {getSelectedConcept()?.nombre || 'No seleccionado'}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Monto</p>
                    <p className="text-2xl font-bold text-primary">
                      S/ {formData.monto ? Number(formData.monto).toFixed(2) : '0.00'}
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      El pago será registrado con estado <strong>Pendiente</strong> y deberá ser
                      aprobado por la secretaría.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Registrar Pago
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/dashboard/payments')}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>

              {/* Help */}
              <Card className="bg-muted/50">
                <CardContent className="py-4 text-sm">
                  <h4 className="font-medium mb-2">Campos obligatorios:</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• Estudiante</li>
                    <li>• Concepto de pago</li>
                    <li>• Monto</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}
