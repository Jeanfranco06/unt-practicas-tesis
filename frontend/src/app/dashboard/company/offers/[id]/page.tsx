'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  User,
  Mail,
  Clock,
  FileText,
  AlertCircle,
  ChevronRight,
  Download,
  Eye,
  CheckCircle2,
  XCircleIcon,
  MoreHorizontal,
  RefreshCw,
  MapPin,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, fetchWithAuth } from '../../_lib/api';
import type { InternshipOffer, InternshipApplication } from '../../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface ApplicationWithStudent extends InternshipApplication {
  estudiante?: {
    id: number;
    codigoEstudiante: string;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email: string;
      telefono?: string;
    };
  };
}

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [offer, setOffer] = useState<InternshipOffer | null>(null);
  const [applications, setApplications] = useState<ApplicationWithStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'applications'>('details');
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    type: 'delete' | 'publish' | null;
  }>({ show: false, type: null });
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithStudent | null>(null);

  const offerId = params.id as string;

  const loadOffer = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/internships/offers/${offerId}`);
      setOffer(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo cargar la oferta',
        variant: 'destructive',
      });
    }
  };

  const loadApplications = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/internships/offers/${offerId}/applications`);
      setApplications(data);
    } catch (err: any) {
      // No mostrar error, puede que no haya postulaciones
      setApplications([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadOffer(), loadApplications()]);
      setIsLoading(false);
    };
    loadData();
  }, [offerId]);

  const handleDelete = async () => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${offerId}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'La oferta fue cancelada exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/company/offers');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo cancelar la oferta',
        variant: 'destructive',
      });
    }
    setConfirmAction({ show: false, type: null });
  };

  const handlePublish = async () => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${offerId}/publish`, {
        method: 'PATCH',
      });
      toast({
        title: 'Éxito',
        description: 'La oferta fue publicada exitosamente.',
        variant: 'default',
      });
      loadOffer();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo publicar la oferta',
        variant: 'destructive',
      });
    }
    setConfirmAction({ show: false, type: null });
  };

  const handleApplicationAction = async (applicationId: number, action: 'approve' | 'reject') => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/applications/${applicationId}/${action}`, {
        method: 'PATCH',
      });
      toast({
        title: 'Éxito',
        description: `La postulación fue ${action === 'approve' ? 'aprobada' : 'rechazada'} exitosamente.`,
        variant: 'default',
      });
      loadApplications();
      setSelectedApplication(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || `No se pudo ${action === 'approve' ? 'aprobar' : 'rechazar'} la postulación`,
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'bg-slate-500/20 text-slate-600';
      case 'publicada':
        return 'bg-emerald-500/20 text-emerald-600';
      case 'cerrada':
        return 'bg-amber-500/20 text-amber-600';
      case 'cancelada':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-slate-500/20 text-slate-600';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'Borrador';
      case 'publicada':
        return 'Publicada';
      case 'cerrada':
        return 'Cerrada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const getApplicationStatusColor = (estado: string) => {
    switch (estado) {
      case 'postulado':
        return 'bg-blue-500/20 text-blue-600';
      case 'preseleccionado':
        return 'bg-amber-500/20 text-amber-600';
      case 'aprobado':
        return 'bg-emerald-500/20 text-emerald-600';
      case 'rechazado':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-slate-500/20 text-slate-600';
    }
  };

  const getApplicationStatusLabel = (estado: string) => {
    switch (estado) {
      case 'postulado':
        return 'Postulado';
      case 'preseleccionado':
        return 'Preseleccionado';
      case 'aprobado':
        return 'Aprobado';
      case 'rechazado':
        return 'Rechazado';
      default:
        return estado;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>No se encontró la oferta</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/company/offers">Volver a ofertas</Link>
        </Button>
      </div>
    );
  }

  const pendingApplications = applications.filter((a) => a.estado === 'postulado');
  const approvedApplications = applications.filter((a) => a.estado === 'aprobado');

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/company/offers">
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{offer.titulo}</h1>
              <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(offer.estado)}`}>
                {getStatusLabel(offer.estado)}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Oferta de prácticas profesionales
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offer.estado === 'borrador' && (
            <Button
              onClick={() => setConfirmAction({ show: true, type: 'publish' })}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Publicar
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/company/offers/${offerId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
          {offer.estado !== 'cancelada' && (
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setConfirmAction({ show: true, type: 'delete' })}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="border-b border-border">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'details'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Detalles
            </span>
            {activeTab === 'details' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`pb-3 text-sm font-medium transition-colors relative ${
              activeTab === 'applications'
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Postulaciones
              {applications.length > 0 && (
                <span className="px-1.5 py-0.5 bg-primary/20 text-primary rounded text-xs">
                  {applications.length}
                </span>
              )}
            </span>
            {activeTab === 'applications' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
              />
            )}
          </button>
        </div>
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'details' ? (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Cupos
                </div>
                <p className="text-2xl font-bold text-foreground">{offer.cupos}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Users className="w-4 h-4" />
                  Postulaciones
                </div>
                <p className="text-2xl font-bold text-foreground">{applications.length}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  Pendientes
                </div>
                <p className="text-2xl font-bold text-amber-500">{pendingApplications.length}</p>
              </div>
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <CheckCircle className="w-4 h-4" />
                  Aprobadas
                </div>
                <p className="text-2xl font-bold text-emerald-500">{approvedApplications.length}</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Descripción
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {offer.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Requisitos
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{offer.requisitos}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                Fechas Importantes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Período de Postulación</p>
                  <p className="font-medium text-foreground">
                    {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} -{' '}
                    {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Período de Práctica</p>
                  <p className="font-medium text-foreground">
                    {new Date(offer.fechaInicioPractica).toLocaleDateString()} -{' '}
                    {new Date(offer.fechaFinPractica).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {applications.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                <p className="text-muted-foreground">No hay postulaciones aún</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Las postulaciones aparecerán aquí cuando los estudiantes se postulen
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {applications.map((app) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 bg-card rounded-xl border border-border hover:border-primary/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-primary/20 rounded-lg">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold text-foreground">
                              {app.estudiante?.usuario?.nombre} {app.estudiante?.usuario?.apellidoPaterno}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded ${getApplicationStatusColor(app.estado)}`}>
                              {getApplicationStatusLabel(app.estado)}
                            </span>
                          </div>
                          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {app.estudiante?.usuario?.email}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2 text-xs">
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                              Código: {app.estudiante?.codigoEstudiante}
                            </span>
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                              Postuló: {new Date(app.fechaPostulacion).toLocaleDateString()}
                            </span>
                          </div>
                          {app.cartaPresentacion && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2 italic">
                              &ldquo;{app.cartaPresentacion}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {app.documentoCvUrl && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={app.documentoCvUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="w-4 h-4 mr-1" />
                              CV
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(app)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        {app.estado === 'postulado' && (
                          <>
                            <Button
                              size="sm"
                              className="bg-emerald-500 hover:bg-emerald-600 text-white"
                              onClick={() => handleApplicationAction(app.id, 'approve')}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleApplicationAction(app.id, 'reject')}
                            >
                              <XCircleIcon className="w-4 h-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, type: null })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`p-2 rounded-lg ${
                  confirmAction.type === 'delete' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                }`}>
                  {confirmAction.type === 'delete' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {confirmAction.type === 'delete' ? 'Cancelar oferta' : 'Publicar oferta'}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    {confirmAction.type === 'delete'
                      ? `¿Estás seguro de que deseas cancelar la oferta "${offer.titulo}"? Esta acción no se puede deshacer.`
                      : `¿Estás seguro de que deseas publicar la oferta "${offer.titulo}"? Una vez publicada, será visible para todos los estudiantes.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, type: null })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirmAction.type === 'delete' ? handleDelete : handlePublish}
                  className={
                    confirmAction.type === 'delete'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }
                >
                  {confirmAction.type === 'delete' ? 'Confirmar' : 'Publicar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {selectedApplication && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedApplication(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-primary/20 rounded-lg">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedApplication.estudiante?.usuario?.nombre} {selectedApplication.estudiante?.usuario?.apellidoPaterno}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${getApplicationStatusColor(selectedApplication.estado)}`}>
                    {getApplicationStatusLabel(selectedApplication.estado)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Código</p>
                    <p className="font-medium text-foreground">{selectedApplication.estudiante?.codigoEstudiante}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground text-sm">{selectedApplication.estudiante?.usuario?.email}</p>
                  </div>
                </div>

                {selectedApplication.estudiante?.usuario?.telefono && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Teléfono</p>
                    <p className="font-medium text-foreground">{selectedApplication.estudiante?.usuario?.telefono}</p>
                  </div>
                )}

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Fecha de Postulación</p>
                  <p className="font-medium text-foreground">
                    {new Date(selectedApplication.fechaPostulacion).toLocaleDateString()}
                  </p>
                </div>

                {selectedApplication.cartaPresentacion && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-2">Carta de Presentación</p>
                    <p className="text-sm text-foreground italic">
                      &ldquo;{selectedApplication.cartaPresentacion}&rdquo;
                    </p>
                  </div>
                )}

                {selectedApplication.documentoCvUrl && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={selectedApplication.documentoCvUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Descargar CV
                    </a>
                  </Button>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-6">
                {selectedApplication.estado === 'postulado' && (
                  <>
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleApplicationAction(selectedApplication.id, 'reject')}
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => handleApplicationAction(selectedApplication.id, 'approve')}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Aprobar
                    </Button>
                  </>
                )}
                <Button onClick={() => setSelectedApplication(null)} variant="outline">
                  Cerrar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
