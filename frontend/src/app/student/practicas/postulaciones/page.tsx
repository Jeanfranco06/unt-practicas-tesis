'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Eye,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/student/StatusBadge';
import { CardSkeleton } from '@/components/student/LoadingState';
import { EmptyState } from '@/components/student/EmptyState';
import Link from 'next/link';
import { API_URL, fetchWithAuth } from '@/app/dashboard/internships/_lib/offers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface Application {
  id: number;
  ofertaId: number;
  oferta: {
    titulo: string;
    empresa: { razonSocial: string };
    fechaInicioPractica: string;
    fechaFinPractica: string;
  };
  estado: 'postulado' | 'preseleccionado' | 'rechazado' | 'aprobado';
  fechaPostulacion: string;
  fechaRevision: string | null;
  cartaPresentacion: string;
}

export default function PostulacionesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      // TODO: Reemplazar con endpoint real cuando exista
      // Por ahora usando mock data
      const mockData: Application[] = [
        {
          id: 1,
          ofertaId: 1,
          oferta: {
            titulo: 'Desarrollador Frontend React',
            empresa: { razonSocial: 'Tech Solutions Perú S.A.C.' },
            fechaInicioPractica: '2024-06-01',
            fechaFinPractica: '2024-12-01',
          },
          estado: 'aprobado',
          fechaPostulacion: '2024-05-15T10:30:00Z',
          fechaRevision: '2024-05-18T14:20:00Z',
          cartaPresentacion: 'Me interesa esta práctica porque...',
        },
        {
          id: 2,
          ofertaId: 2,
          oferta: {
            titulo: 'Pasante de Base de Datos',
            empresa: { razonSocial: 'DataCorp EIRL' },
            fechaInicioPractica: '2024-07-01',
            fechaFinPractica: '2024-12-31',
          },
          estado: 'postulado',
          fechaPostulacion: '2024-05-20T09:15:00Z',
          fechaRevision: null,
          cartaPresentacion: 'Tengo experiencia en SQL y PostgreSQL...',
        },
        {
          id: 3,
          ofertaId: 3,
          oferta: {
            titulo: 'Desarrollador Backend Node.js',
            empresa: { razonSocial: 'Startup Innovación' },
            fechaInicioPractica: '2024-06-15',
            fechaFinPractica: '2024-11-15',
          },
          estado: 'rechazado',
          fechaPostulacion: '2024-04-10T16:45:00Z',
          fechaRevision: '2024-04-12T11:30:00Z',
          cartaPresentacion: 'Conocimientos en Express y MongoDB...',
        },
      ];
      setApplications(mockData);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar las postulaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusConfig = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return { variant: 'active' as const, icon: CheckCircle, color: 'text-emerald-500', label: 'Aprobado' };
      case 'preseleccionado':
        return { variant: 'pending' as const, icon: AlertCircle, color: 'text-amber-500', label: 'Preseleccionado' };
      case 'rechazado':
        return { variant: 'rejected' as const, icon: XCircle, color: 'text-red-500', label: 'Rechazado' };
      default:
        return { variant: 'draft' as const, icon: Clock, color: 'text-blue-500', label: 'Postulado' };
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/student/practicas">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a prácticas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Mis Postulaciones</h1>
          <p className="text-muted-foreground mt-1">
            Revisa el estado de tus postulaciones y el seguimiento de cada proceso
          </p>
        </div>
        <Button asChild>
          <Link href="/student/practicas/ofertas">
            <Briefcase className="w-4 h-4 mr-2" />
            Ver nuevas ofertas
          </Link>
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total postulaciones', value: applications.length },
          { label: 'Aprobadas', value: applications.filter((a) => a.estado === 'aprobado').length, color: 'text-emerald-500' },
          { label: 'En revisión', value: applications.filter((a) => a.estado === 'postulado' || a.estado === 'preseleccionado').length, color: 'text-amber-500' },
          { label: 'Rechazadas', value: applications.filter((a) => a.estado === 'rechazado').length, color: 'text-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
            <p className={`text-2xl font-bold ${stat.color || 'text-foreground'}`}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          <AnimatePresence>
            {applications.map((app) => {
              const status = getStatusConfig(app.estado);
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={app.id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Info */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{app.oferta.titulo}</h3>
                          <p className="text-sm text-muted-foreground">{app.oferta.empresa.razonSocial}</p>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {formatDate(app.oferta.fechaInicioPractica)} - {formatDate(app.oferta.fechaFinPractica)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>Postulado: {formatDate(app.fechaPostulacion)}</span>
                            </div>
                          </div>

                          {app.fechaRevision && (
                            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                              <RotateCcw className="w-4 h-4" />
                              <span>Revisado: {formatDate(app.fechaRevision)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Status & Actions */}
                      <div className="flex flex-col items-start md:items-end gap-3">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          <StatusBadge variant={status.variant} size="sm">
                            {status.label}
                          </StatusBadge>
                        </div>

                        {app.estado === 'aprobado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push('/student/practicas/1')}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Ver mi práctica
                          </Button>
                        )}

                        {app.cartaPresentacion && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                            <FileText className="w-3 h-3" />
                            <span className="line-clamp-1 max-w-[200px]">{app.cartaPresentacion}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress indicator for pending applications */}
                  {(app.estado === 'postulado' || app.estado === 'preseleccionado') && (
                    <div className="px-6 py-3 bg-muted/30 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full transition-all"
                            style={{ width: app.estado === 'preseleccionado' ? '60%' : '30%' }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {app.estado === 'preseleccionado' ? 'En revisión avanzada' : 'En revisión inicial'}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No tienes postulaciones"
          description="Aún no te has postulado a ninguna oferta de práctica. Explora las ofertas disponibles y comienza tu proceso."
          action={{
            label: 'Ver ofertas disponibles',
            onClick: () => router.push('/student/practicas/ofertas'),
          }}
        />
      )}
    </motion.div>
  );
}
