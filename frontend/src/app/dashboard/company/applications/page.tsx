'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  X,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  Briefcase,
  Eye,
  CheckCircle2,
  XCircleIcon,
  AlertCircle,
  GraduationCap,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from '../_lib/api';
import type { InternshipApplication } from '../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const statusOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'postulado', label: 'Postulados', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'preseleccionado', label: 'Preseleccionados', color: 'bg-amber-500/20 text-amber-600' },
  { value: 'aprobado', label: 'Aprobados', color: 'bg-emerald-500/20 text-emerald-600' },
  { value: 'rechazado', label: 'Rechazados', color: 'bg-red-500/20 text-red-600' },
];

interface ApplicationWithDetails {
  id: number;
  ofertaId: number;
  estudianteId: number;
  documentoCvUrl?: string;
  cartaPresentacion?: string;
  estado: 'postulado' | 'preseleccionado' | 'rechazado' | 'aprobado';
  fechaPostulacion: string;
  fechaRevision?: string;
  oferta?: {
    id: number;
    titulo: string;
    cupos: number;
  };
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
    carrera?: {
      nombre: string;
    };
  };
}

export default function CompanyApplicationsPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    applicationId: number | null;
    action: 'approve' | 'reject' | null;
    studentName: string;
  }>({ show: false, applicationId: null, action: null, studentName: '' });

  useEffect(() => {
    const getEmpresaId = async () => {
      const storedEmpresaId = localStorage.getItem('empresaId');
      if (storedEmpresaId) {
        setEmpresaId(storedEmpresaId);
        return;
      }
      if (user?.sub) {
        try {
          const data = await fetchWithAuth(`${API_URL}/api/company-representatives/user/${user.sub}`);
          if (data?.empresaId) {
            const newEmpresaId = data.empresaId.toString();
            setEmpresaId(newEmpresaId);
            localStorage.setItem('empresaId', newEmpresaId);
          }
        } catch (err) {
          console.error('Error al obtener empresaId:', err);
        }
      }
      if (!empresaId) setIsLoading(false);
    };
    if (isAuthenticated) {
      getEmpresaId();
    }
  }, [user, isAuthenticated]);

  const loadApplications = async () => {
    if (!empresaId) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(
        `${API_URL}/api/internships/company/applications?empresaId=${empresaId}`
      );
      setApplications(data);
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

  useEffect(() => {
    if (empresaId) {
      loadApplications();
    }
  }, [empresaId]);

  const getStatusColor = (estado: string) => {
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

  const getStatusLabel = (estado: string) => {
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
    setConfirmAction({ show: false, applicationId: null, action: null, studentName: '' });
  };

  const showConfirmAction = (applicationId: number, action: 'approve' | 'reject', studentName: string) => {
    setConfirmAction({ show: true, applicationId, action, studentName });
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.estudiante?.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.estudiante?.usuario?.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.estudiante?.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.oferta?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todas' || app.estado === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    postulados: applications.filter((a) => a.estado === 'postulado').length,
    preseleccionados: applications.filter((a) => a.estado === 'preseleccionado').length,
    aprobados: applications.filter((a) => a.estado === 'aprobado').length,
    rechazados: applications.filter((a) => a.estado === 'rechazado').length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Postulaciones Recibidas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Revisa las postulaciones de estudiantes a tus ofertas de prácticas
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-primary' },
          { label: 'Postulados', value: stats.postulados, color: 'bg-blue-500' },
          { label: 'Preseleccionados', value: stats.preseleccionados, color: 'bg-amber-500' },
          { label: 'Aprobados', value: stats.aprobados, color: 'bg-emerald-500' },
          { label: 'Rechazados', value: stats.rechazados, color: 'bg-red-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color.replace('bg-', 'text-')}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por estudiante o oferta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground text-sm mr-1">
            <Filter className="w-4 h-4" />
            <span>Estado:</span>
          </div>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                statusFilter === option.value
                  ? `${option.color || 'bg-muted text-muted-foreground'} ring-1 ring-current font-medium`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
          {(searchTerm || statusFilter !== 'todas') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todas');
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredApplications.map((app) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.005 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-primary/20 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-emerald-500/10 rounded-xl">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        {app.estudiante?.usuario?.nombre} {app.estudiante?.usuario?.apellidoPaterno}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getStatusColor(app.estado)}`}>
                        {getStatusLabel(app.estado)}
                      </span>
                      {app.estado === 'postulado' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-600 animate-pulse">
                          Por revisar
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                      <Mail className="w-3.5 h-3.5" />
                      {app.estudiante?.usuario?.email}
                    </p>
                    {app.estudiante?.carrera && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <GraduationCap className="w-3.5 h-3.5" />
                        {app.estudiante.carrera.nombre}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-lg flex items-center gap-1.5 font-medium">
                        <Briefcase className="w-3.5 h-3.5" />
                        {app.oferta?.titulo}
                      </span>
                      <span className="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-lg flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        Postuló: {new Date(app.fechaPostulacion).toLocaleDateString()}
                      </span>
                      <span className="px-2.5 py-1.5 bg-muted text-muted-foreground rounded-lg flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Código: {app.estudiante?.codigoEstudiante}
                      </span>
                    </div>
                    {app.cartaPresentacion && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground line-clamp-2 italic">
                          &ldquo;{app.cartaPresentacion}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(app)}
                    className="flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </Button>
                  {app.documentoCvUrl && (
                    <Button variant="outline" size="sm" asChild className="flex items-center gap-1.5">
                      <a href={app.documentoCvUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                        CV
                      </a>
                    </Button>
                  )}
                  {app.estado === 'postulado' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5"
                        onClick={() => showConfirmAction(app.id, 'approve', `${app.estudiante?.usuario?.nombre} ${app.estudiante?.usuario?.apellidoPaterno}`)}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-1.5"
                        onClick={() => showConfirmAction(app.id, 'reject', `${app.estudiante?.usuario?.nombre} ${app.estudiante?.usuario?.apellidoPaterno}`)}
                      >
                        <XCircleIcon className="w-4 h-4" />
                        Rechazar
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredApplications.length === 0 && (
          <div className="text-center py-16 bg-card rounded-xl border border-border">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <p className="text-muted-foreground font-medium">No se encontraron postulaciones</p>
            {(searchTerm || statusFilter !== 'todas') && (
              <p className="text-sm text-muted-foreground mt-2">Intenta ajustar los filtros de búsqueda</p>
            )}
            <div className="mt-6">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/dashboard/company/offers">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Ver mis ofertas
                </Link>
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, applicationId: null, action: null, studentName: '' })}
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
                  confirmAction.action === 'reject' ? 'bg-red-500/20' : 'bg-emerald-500/20'
                }`}>
                  {confirmAction.action === 'reject' ? (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {confirmAction.action === 'reject' ? 'Rechazar postulación' : 'Aprobar postulación'}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    {confirmAction.action === 'reject'
                      ? `¿Estás seguro de que deseas rechazar la postulación de "${confirmAction.studentName}"? Esta acción notificará al estudiante.`
                      : `¿Estás seguro de que deseas aprobar la postulación de "${confirmAction.studentName}"? El estudiante será notificado y se creará una práctica profesional.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, applicationId: null, action: null, studentName: '' })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => confirmAction.applicationId && handleApplicationAction(confirmAction.applicationId, confirmAction.action!)}
                  className={
                    confirmAction.action === 'reject'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }
                >
                  {confirmAction.action === 'reject' ? 'Rechazar' : 'Aprobar'}
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
                <div className="p-3 bg-gradient-to-br from-primary/20 to-emerald-500/10 rounded-xl">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedApplication.estudiante?.usuario?.nombre} {selectedApplication.estudiante?.usuario?.apellidoPaterno}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(selectedApplication.estado)}`}>
                    {getStatusLabel(selectedApplication.estado)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Código Estudiante</p>
                    <p className="font-medium text-foreground">{selectedApplication.estudiante?.codigoEstudiante}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Fecha de Postulación</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedApplication.fechaPostulacion).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-foreground">{selectedApplication.estudiante?.usuario?.email}</p>
                </div>

                {selectedApplication.estudiante?.usuario?.telefono && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Teléfono</p>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {selectedApplication.estudiante?.usuario?.telefono}
                    </p>
                  </div>
                )}

                {selectedApplication.estudiante?.carrera && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Carrera</p>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      {selectedApplication.estudiante.carrera.nombre}
                    </p>
                  </div>
                )}

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Oferta</p>
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {selectedApplication.oferta?.titulo}
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
                      onClick={() => {
                        setSelectedApplication(null);
                        showConfirmAction(selectedApplication.id, 'reject', `${selectedApplication.estudiante?.usuario?.nombre} ${selectedApplication.estudiante?.usuario?.apellidoPaterno}`);
                      }}
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => {
                        setSelectedApplication(null);
                        showConfirmAction(selectedApplication.id, 'approve', `${selectedApplication.estudiante?.usuario?.nombre} ${selectedApplication.estudiante?.usuario?.apellidoPaterno}`);
                      }}
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
