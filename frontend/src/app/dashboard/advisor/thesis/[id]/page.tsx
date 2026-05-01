'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  ChevronLeft,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  XCircle,
  Calendar,
  ClipboardCheck,
  Edit,
  Download,
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
  en_registro: { label: 'En Registro', color: 'bg-gray-500/20 text-gray-600', icon: Clock },
  propuesto: { label: 'Propuesto', color: 'bg-blue-500/20 text-blue-600', icon: FileText },
  aprobado: { label: 'Aprobado', color: 'bg-emerald-500/20 text-emerald-600', icon: CheckCircle },
  en_desarrollo: { label: 'En Desarrollo', color: 'bg-amber-500/20 text-amber-600', icon: Clock },
  en_revision: { label: 'En Revisión', color: 'bg-purple-500/20 text-purple-600', icon: ClipboardCheck },
  culminado: { label: 'Culminado', color: 'bg-green-500/20 text-green-600', icon: CheckCircle },
  desaprobado: { label: 'Desaprobado', color: 'bg-red-500/20 text-red-600', icon: XCircle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-600', icon: XCircle },
};

const estadoEntregaConfig: Record<string, { label: string; color: string }> = {
  entregado: { label: 'Entregado', color: 'bg-blue-500/20 text-blue-600' },
  revisando: { label: 'Revisando', color: 'bg-amber-500/20 text-amber-600' },
  aprobado: { label: 'Aprobado', color: 'bg-emerald-500/20 text-emerald-600' },
  observado: { label: 'Observado', color: 'bg-red-500/20 text-red-600' },
};

export default function AdvisorThesisDetailPage() {
  const { toast } = useToast();
  const params = useParams();
  const thesisId = parseInt(params.id as string);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewData, setReviewData] = useState({
    estado: 'aprobado',
    retroalimentacion: '',
  });

  // @ts-ignore - TRPC types
  const { data: thesis, isLoading } = (trpc as any).thesis?.getMyAdvisorProjects?.useQuery() || { data: [], isLoading: false };
  // @ts-ignore - TRPC types
  const { data: submissions, refetch: refetchSubmissions } = (trpc as any).thesis?.getProjectSubmissions?.useQuery(
    { proyectoId: thesisId },
    { enabled: !!thesisId }
  ) || { data: [], refetch: () => {} };
  // @ts-ignore - TRPC types
  const { mutate: reviewSubmission, isPending: isReviewing } = (trpc as any).thesis?.reviewDeliverable?.useMutation({
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Entrega revisada correctamente',
      });
      setShowReviewModal(false);
      refetchSubmissions();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo revisar la entrega',
        variant: 'destructive',
      });
    },
  });

  const project = thesis?.find((t: any) => t.id === thesisId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/advisor/thesis">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>
        <LoadingState rows={5} />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/advisor/thesis">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Volver
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Proyecto no encontrado</h2>
          <p className="text-muted-foreground mt-2">No tienes asignado este proyecto o no existe.</p>
        </div>
      </div>
    );
  }

  const estado = estadoConfig[project.estado] || estadoConfig.en_desarrollo;
  const EstadoIcon = estado.icon;

  const handleReview = () => {
    if (!selectedSubmission) return;
    reviewSubmission({
      submissionId: selectedSubmission.id,
      ...reviewData,
    });
  };

  const openReviewModal = (submission: any) => {
    setSelectedSubmission(submission);
    setReviewData({
      estado: 'aprobado',
      retroalimentacion: '',
    });
    setShowReviewModal(true);
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
          <Link href="/dashboard/advisor/thesis">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver a tesis
          </Link>
        </Button>
      </motion.div>

      {/* Main Info Card */}
      <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{project.titulo}</h1>
                <p className="text-muted-foreground mt-1">
                  {project.estudiante?.usuario?.nombre} {project.estudiante?.usuario?.apellidoPaterno} • {project.estudiante?.codigoUniversitario}
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5 ${estado.color}`}>
                    <EstadoIcon className="w-4 h-4" />
                    {estado.label}
                  </span>
                  <span className="px-3 py-1.5 bg-muted rounded-full text-sm text-muted-foreground">
                    {project.areaConocimiento}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 lg:border-l lg:pl-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Fecha de Registro</p>
              <p className="font-medium">{new Date(project.fechaRegistro).toLocaleDateString('es-ES')}</p>
            </div>
            {project.fechaAprobacion && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fecha de Aprobación</p>
                <p className="font-medium">{new Date(project.fechaAprobacion).toLocaleDateString('es-ES')}</p>
              </div>
            )}
          </div>
        </div>

        {project.resumen && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold mb-2">Resumen</h3>
            <p className="text-sm text-muted-foreground">{project.resumen}</p>
          </div>
        )}
      </motion.div>

      {/* Deliverables & Submissions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold mb-4">Entregables y Entregas</h2>
        <div className="space-y-4">
          {project.entregables?.length > 0 ? (
            project.entregables.map((deliverable: any) => {
              const relatedSubmissions = submissions?.filter((s: any) => s.entregableId === deliverable.id) || [];
              const lastSubmission = relatedSubmissions[0];

              return (
                <div
                  key={deliverable.id}
                  className="p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{deliverable.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{deliverable.descripcion}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Fecha límite: {new Date(deliverable.fechaLimite).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    {lastSubmission ? (
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoEntregaConfig[lastSubmission.estado]?.color || 'bg-muted'}`}>
                          {estadoEntregaConfig[lastSubmission.estado]?.label || lastSubmission.estado}
                        </span>
                        {lastSubmission.estado === 'entregado' && (
                          <Button
                            size="sm"
                            onClick={() => openReviewModal(lastSubmission)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Revisar
                          </Button>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <a href={lastSubmission.documentoUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4 mr-1" />
                            Ver
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Sin entregas</span>
                    )}
                  </div>

                  {relatedSubmissions.length > 0 && (
                    <div className="mt-4 pt-4 border-t space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Historial de entregas:</p>
                      {relatedSubmissions.map((sub: any) => (
                        <div key={sub.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{new Date(sub.fechaEntrega).toLocaleDateString('es-ES')}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${estadoEntregaConfig[sub.estado]?.color || 'bg-muted'}`}>
                              {estadoEntregaConfig[sub.estado]?.label || sub.estado}
                            </span>
                          </div>
                          <span className="text-muted-foreground truncate max-w-[200px]">{sub.tituloEntrega}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-muted/30 rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No hay entregables definidos</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Revisar Entrega</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {selectedSubmission?.tituloEntrega}
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Estado de la revisión</Label>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setReviewData({ ...reviewData, estado: 'aprobado' })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    reviewData.estado === 'aprobado'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                  }`}
                >
                  Aprobar
                </button>
                <button
                  onClick={() => setReviewData({ ...reviewData, estado: 'observado' })}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    reviewData.estado === 'observado'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                  }`}
                >
                  Observar
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="retroalimentacion">Retroalimentación</Label>
              <Textarea
                id="retroalimentacion"
                value={reviewData.retroalimentacion}
                onChange={(e) => setReviewData({ ...reviewData, retroalimentacion: e.target.value })}
                placeholder={reviewData.estado === 'aprobado' ? 'Comentarios positivos...' : 'Indica qué debe corregir el estudiante...'}
                className="mt-1"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReviewModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReview}
              disabled={isReviewing}
              className={reviewData.estado === 'aprobado' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}
            >
              {isReviewing ? 'Guardando...' : reviewData.estado === 'aprobado' ? 'Aprobar Entrega' : 'Registrar Observación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
