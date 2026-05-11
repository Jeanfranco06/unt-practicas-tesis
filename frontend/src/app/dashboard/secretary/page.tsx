'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  FileText,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

interface PaymentStats {
  totalPagos: number;
  montoTotal: number;
  pagosPorEstado: { estado: string; count: number; monto: number }[];
}

interface RecentPayment {
  id: number;
  codigoPago: string;
  estudiante: {
    usuario: {
      nombre: string;
      apellidoPaterno: string;
    };
  };
  concepto: {
    nombre: string;
  };
  monto: number;
  estado: string;
  fechaPago: string | null;
}

export default function SecretaryDashboardPage() {
  const { hasRole, hasAnyRole } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<RecentPayment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verify role - only secretaries should access this page
    if (!hasAnyRole(['Secretaria', 'Administrador', 'Coordinador'])) {
      router.push('/dashboard');
      return;
    }

    fetchData();
  }, [hasRole, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, paymentsData] = await Promise.all([
        fetchWithAuth('/api/payments/stats'),
        fetchWithAuth('/api/payments/pending'),
      ]);

      setStats(statsData);
      setRecentPayments(paymentsData.data?.slice(0, 5) || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pendiente':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'rechazado':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'procesando':
        return 'bg-blue-100 text-blue-800';
      case 'rechazado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <ProtectedRoute>
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard de Secretaría
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestión de pagos y trámites administrativos
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Pagos
                </CardTitle>
                <CreditCard className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalPagos || 0}
                </div>
                <p className="text-xs text-muted-foreground">Pagos registrados</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Monto Total
                </CardTitle>
                <DollarSign className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  S/ {Number(stats?.montoTotal || 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Ingresos totales</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendientes
                </CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.pagosPorEstado?.find(p => p.estado === 'pendiente')?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">Pagos por aprobar</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completados
                </CardTitle>
                <TrendingUp className="w-4 h-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.pagosPorEstado?.find(p => p.estado === 'completado')?.count || 0}
                </div>
                <p className="text-xs text-muted-foreground">Pagos aprobados</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pagos Pendientes de Aprobación</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Últimos pagos registrados que requieren revisión
                </p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/payments')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Ver todos
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : recentPayments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p>No hay pagos pendientes de aprobación</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-foreground">
                          Código
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">
                          Estudiante
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">
                          Concepto
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">
                          Monto
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">
                          Estado
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-foreground">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayments.map((payment) => (
                        <tr key={payment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            {payment.codigoPago}
                          </td>
                          <td className="py-3 px-4">
                            {payment.estudiante?.usuario?.nombre}{' '}
                            {payment.estudiante?.usuario?.apellidoPaterno}
                          </td>
                          <td className="py-3 px-4">{payment.concepto?.nombre}</td>
                          <td className="py-3 px-4 font-medium">
                            S/ {Number(payment.monto).toFixed(2)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                payment.estado
                              )}`}
                            >
                              {payment.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(`/dashboard/payments?id=${payment.id}`)
                                }
                              >
                                Ver
                              </Button>
                            </div>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                onClick={() => router.push('/dashboard/payments')}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Gestionar Pagos
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push('/dashboard/students')}
              >
                <Users className="w-4 h-4 mr-2" />
                Ver Estudiantes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribución de Estados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.pagosPorEstado?.map((item) => (
                  <div
                    key={item.estado}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.estado)}
                      <span className="capitalize">{item.estado}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-medium">{item.count}</span>
                      <span className="text-sm text-muted-foreground">
                        S/ {Number(item.monto).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-muted-foreground text-center py-4">
                    No hay datos disponibles
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
