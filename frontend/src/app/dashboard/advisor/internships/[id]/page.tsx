'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Briefcase,
  GraduationCap,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronLeft,
  XCircle,
  Hourglass,
  Calendar,
  User,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/student/LoadingState';
import { trpc } from '@/lib/trpc/react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

const estadoConfig: Record<string, { label: string; color: string; icon: any }> = {
  activa: { label: 'Activa', color: 'bg-emerald-500/20 text-emerald-600', icon: CheckCircle },
  en_evaluacion: { label: 'En Evaluación', color: 'bg-amber-500/20 text-amber-600', icon: Hourglass },
  pendiente_asignacion: { label: 'Pendiente Asignación', color: 'bg-blue-500/20 text-blue-600', icon: AlertCircle },
  finalizada: { label: 'Finalizada', color: 'bg-gray-500/20 text-gray-600', icon: CheckCircle },
  cancelada: { label: 'Cancelada', color: 'bg-red-500/20 text-red-600', icon: XCircle },
};

export default function AdvisorInternshipDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const internshipId = parseInt(params.id as string);

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    calificacion: 15,
    comentario: '',
    cumplioObjetivos: true,
    recomendar: true,
  });

  // @ts-ignore - TRPC types
  const { data: internships, isLoading } = (trpc as any).internships?.getMyAdvisedInternships?.useQuery() || { data: [], isLoading: false };
  // @ts-ignore - TRPC types
  const { mutate: submitEvaluation, isPending: isSubmitting } = (trpc as any).internships?.finalEvaluation?.useMutation({
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Evaluación registrada correctamente',
      });
      setShowEvaluationModal(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo registrar la evaluación',
        variant: 'destructive',
      });
    },
  });

  const internship = internships?.find((i: any) => i.id === internshipId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/advisor/internships">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>
        <LoadingState rows={5} />
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/advisor/internships">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Práctica no encontrada</h2>
          <p className="text-muted-foreground mt-2">No tienes asignada esta práctica o no existe.</p>
        </div>
      </div>
    );
  }

  const estado = estadoConfig[internship.estado] || estadoConfig.activa;
  const EstadoIcon = estado.icon;
  const progressPercentage = Math.min((internship.horasCompletadas / internship.horasTotalesRequeridas) * 100, 100);

  const handleEvaluate = () => {
    submitEvaluation({
      practicaId: internshipId,
      ...evaluationData,
    });
  };

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
          <Link href="/dashboard/advisor/internships">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a prácticas
          </Link>
        </Button>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {internship.estudiante?.usuario?.nombre} {internship.estudiante?.usuario?.apellidoPaterno}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {internship.estudiante?.codigoUniversitario} • {internship.estudiante?.escuelaProfesional}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${estado.color}`}>
                    <EstadoIcon className="w-4 h-4" />
                    {estado.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 lg:border-l lg:pl-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Empresa</p>
              <p className="font-medium">
                {internship.empresa?.razonSocial || internship.nombreEmpresaExterna || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Asesor Empresa</p>
              <p className="font-medium">{internship.asesorEmpresaNombre || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Período</p>
              <p className="font-medium">
                {new Date(internship.fechaInicio).toLocaleDateString('es-ES')} - {new Date(internship.fechaFin).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Progress & Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Progreso de Horas</h3>
          </div>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Completadas</span>
              <span className="font-medium">{internship.horasCompletadas} / {internship.horasTotalesRequeridas}h</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{progressPercentage.toFixed(1)}% completado</p>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-purple-500" />
            <h3 className="font-semibold">Informes</h3>
          </div>
          <div className="space-y-2">
            {internship.informes?.length > 0 ? (
              internship.informes.map((informe: any) => (
                <div key={informe.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm capitalize">{informe.tipo}</span>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    informe.estado === 'aprobado' ? 'bg-emerald-500/20 text-emerald-600' :
                    informe.estado === 'rechazado' ? 'bg-red-500/20 text-red-600' :
                    'bg-amber-500/20 text-amber-600'
                  }`}>
                    {informe.estado}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Sin informes registrados</p>
            )}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <h3 className="font-semibold">Estado</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Estado actual</span>
              <span className="font-medium">{estado.label}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Días restantes</span>
              <span className="font-medium">
                {Math.max(0, Math.ceil((new Date(internship.fechaFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} días
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      {internship.estado === 'en_evaluacion' && (
        <motion.div variants={itemVariants} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-amber-700">Evaluación Pendiente</h3>
              <p className="text-sm text-amber-600 mt-1">
                Esta práctica está lista para la evaluación final. Registra tu evaluación.
              </p>
            </div>
            <Button onClick={() => setShowEvaluationModal(true)} className="bg-amber-500 hover:bg-amber-600">
              <Edit className="w-4 h-4 mr-2" />
              Registrar Evaluación
            </Button>
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href={`/dashboard/advisor/internships/${internshipId}/hours`}>
          <div className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium">Revisar Horas</h4>
                <p className="text-sm text-muted-foreground">Ver y aprobar registros de horas</p>
              </div>
              <ChevronLeft className="w-5 h-5 ml-auto rotate-180 text-muted-foreground" />
            </div>
          </div>
        </Link>

        <Link href={`/dashboard/advisor/students/${internship.estudianteId}`}>
          <div className="p-4 bg-card rounded-xl border border-border hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                <User className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="font-medium">Ver Estudiante</h4>
                <p className="text-sm text-muted-foreground">Perfil completo del estudiante</p>
              </div>
              <ChevronLeft className="w-5 h-5 ml-auto rotate-180 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Evaluation Modal */}
      <Dialog open={showEvaluationModal} onOpenChange={setShowEvaluationModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Evaluación Final de Práctica</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Registra tu evaluación final para {internship.estudiante?.usuario?.nombre} {internship.estudiante?.usuario?.apellidoPaterno}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="calificacion">Calificación (0-20)</Label>
              <Input
                id="calificacion"
                type="number"
                min={0}
                max={20}
                value={evaluationData.calificacion}
                onChange={(e) => setEvaluationData({ ...evaluationData, calificacion: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="comentario">Comentario</Label>
              <Textarea
                id="comentario"
                value={evaluationData.comentario}
                onChange={(e) => setEvaluationData({ ...evaluationData, comentario: e.target.value })}
                placeholder="Observaciones sobre el desempeño del estudiante..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cumplioObjetivos"
                checked={evaluationData.cumplioObjetivos}
                onChange={(e) => setEvaluationData({ ...evaluationData, cumplioObjetivos: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="cumplioObjetivos" className="text-sm cursor-pointer">
                Cumplió con los objetivos de la práctica
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="recomendar"
                checked={evaluationData.recomendar}
                onChange={(e) => setEvaluationData({ ...evaluationData, recomendar: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="recomendar" className="text-sm cursor-pointer">
                Recomendar para futuras prácticas
              </Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowEvaluationModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleEvaluate}
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600"
            >
              {isSubmitting ? 'Guardando...' : 'Registrar Evaluación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
