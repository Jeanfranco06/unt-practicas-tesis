'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  Hourglass,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/student/LoadingState';
import { trpc } from '@/lib/trpc/react';
import { useToast } from '@/components/ui/use-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

export default function AdvisorInternshipHoursPage() {
  const { toast } = useToast();
  const params = useParams();
  const internshipId = parseInt(params.id as string);

  // @ts-ignore - TRPC types
  const { data: hours, isLoading, refetch } = (trpc as any).internships?.getHoursTrackingByInternship?.useQuery(
    { practicaId: internshipId },
    { enabled: !!internshipId }
  ) || { data: [], isLoading: false, refetch: () => {} };

  // @ts-ignore - TRPC types
  const { mutate: approveHours, isPending: isApproving } = (trpc as any).internships?.approveHours?.useMutation({
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Horas aprobadas correctamente',
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron aprobar las horas',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/advisor/internships/${internshipId}`}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>
        <LoadingState rows={5} />
      </div>
    );
  }

  const pendingHours = hours?.filter((h: any) => !h.aprobadoAsesor) || [];
  const approvedHours = hours?.filter((h: any) => h.aprobadoAsesor) || [];
  const totalPending = pendingHours.reduce((acc: number, h: any) => acc + h.horas, 0);
  const totalApproved = approvedHours.reduce((acc: number, h: any) => acc + h.horas, 0);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/advisor/internships/${internshipId}`}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a práctica
          </Link>
        </Button>
      </motion.div>

      {/* Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Revisión de Horas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Aprueba o rechaza los registros de horas de la práctica
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <Hourglass className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold">Pendientes</h3>
          </div>
          <p className="text-3xl font-bold">{pendingHours.length}</p>
          <p className="text-sm text-muted-foreground">{totalPending} horas por aprobar</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold">Aprobadas</h3>
          </div>
          <p className="text-3xl font-bold">{approvedHours.length}</p>
          <p className="text-sm text-muted-foreground">{totalApproved} horas aprobadas</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Total Registrado</h3>
          </div>
          <p className="text-3xl font-bold">{hours?.length || 0}</p>
          <p className="text-sm text-muted-foreground">{totalPending + totalApproved} horas totales</p>
        </div>
      </motion.div>

      {/* Pending Hours */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">Horas Pendientes de Aprobación</h2>
        <div className="space-y-3">
          {pendingHours.length > 0 ? (
            pendingHours.map((hour: any) => (
              <div
                key={hour.id}
                className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">{hour.descripcionActividad}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(hour.fechaTrabajada).toLocaleDateString('es-ES')}
                        </span>
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-600 rounded text-xs font-medium">
                          {hour.horas} horas
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-emerald-600"
                      onClick={() => approveHours({ trackingId: hour.id, role: 'asesor' })}
                      disabled={isApproving}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-500" />
              <p className="text-muted-foreground">No hay horas pendientes de aprobación</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Approved Hours */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">Horas Aprobadas</h2>
        <div className="space-y-3">
          {approvedHours.length > 0 ? (
            approvedHours.map((hour: any) => (
              <div
                key={hour.id}
                className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{hour.descripcionActividad}</p>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(hour.fechaTrabajada).toLocaleDateString('es-ES')}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-600 rounded text-xs font-medium">
                        {hour.horas} horas
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded text-xs">
                        Aprobado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No hay horas aprobadas aún</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
