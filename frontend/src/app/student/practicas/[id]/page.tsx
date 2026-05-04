'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  Clock,
  FileText,
  User,
  GraduationCap,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Upload,
  Plus,
  History,
  CheckSquare,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/student/StatusBadge';
import { EmptyState } from '@/components/student/EmptyState';
import Link from 'next/link';
import { API_URL, fetchWithAuth } from '@/app/dashboard/internships/_lib/offers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface HourEntry {
  id: number;
  fecha: string;
  horas: number;
  actividad: string;
  aprobadoEmpresa: boolean;
  aprobadoAsesor: boolean;
}

interface Report {
  id: number;
  tipo: 'parcial' | 'final';
  titulo: string;
  fechaEntrega: string;
  estado: 'pendiente' | 'aprobado' | 'observado';
  comentarioAsesor?: string;
}

interface Practica {
  id: number | string;
  empresa: string;
  cargo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'activa' | 'en_evaluacion' | 'finalizada';
  horasTotales: number;
  horasCompletadas: number;
  supervisorEmpresa: string;
  asesorAcademico?: {
    nombre: string;
    email: string;
  };
  horasRegistradas: HourEntry[];
  informes: Report[];
  tipo?: 'practica' | 'postulacion';
  estadoPostulacion?: string;
  fechaPostulacion?: string;
}

export default function PracticaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [practica, setPractica] = useState<Practica | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hoursForm, setHoursForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    horas: '',
    actividad: '',
  });

  const [reportForm, setReportForm] = useState({
    tipo: 'parcial' as 'parcial' | 'final',
    titulo: '',
    contenido: '',
  });

  useEffect(() => {
    loadPractica();
  }, [params.id]);

  const loadPractica = async () => {
    try {
      setIsLoading(true);
      const id = params.id as string;

      // Check if this is an application (app-X) or a real internship
      if (id.startsWith('app-')) {
        // Load application data
        const appId = id.replace('app-', '');
        const applications = await fetchWithAuth(`${API_URL}/api/internships/my-applications`);
        const app = applications.find((a: any) => a.id.toString() === appId);
        
        if (!app) {
          setPractica(null);
          setIsLoading(false);
          return;
        }

        // Convert application to practice format
        const appData: Practica = {
          id: id,
          empresa: app.oferta?.empresa?.razonSocial || 'Empresa no especificada',
          cargo: app.oferta?.titulo || 'Cargo no especificado',
          descripcion: app.cartaPresentacion || 'Práctica aprobada pendiente de inicio.',
          fechaInicio: app.oferta?.fechaInicioPractica || '',
          fechaFin: app.oferta?.fechaFinPractica || '',
          estado: 'activa',
          horasTotales: app.oferta?.horasTotalesRequeridas || 320,
          horasCompletadas: 0,
          supervisorEmpresa: 'Por asignar',
          asesorAcademico: undefined,
          horasRegistradas: [],
          informes: [],
          tipo: 'postulacion',
          estadoPostulacion: app.estado,
          fechaPostulacion: app.fechaPostulacion,
        };
        
        setPractica(appData);
      } else {
        // Load real internship data
        const data = await fetchWithAuth(`${API_URL}/api/internships/my-internship`);
        
        if (data && !data.message) {
          const practiceData: Practica = {
            id: data.id,
            empresa: data.empresa?.razonSocial || data.nombreEmpresaExterna || 'Empresa no especificada',
            cargo: data.oferta?.titulo || 'Cargo no especificado',
            descripcion: data.oferta?.descripcion || data.observaciones || '',
            fechaInicio: data.fechaInicio || data.oferta?.fechaInicioPractica || '',
            fechaFin: data.fechaFin || data.oferta?.fechaFinPractica || '',
            estado: data.estado === 'activa' ? 'activa' : data.estado === 'finalizada' ? 'finalizada' : 'en_evaluacion',
            horasTotales: data.horasTotalesRequeridas || 320,
            horasCompletadas: data.seguimiento?.reduce((acc: number, s: any) => acc + (s.horas || 0), 0) || 0,
            supervisorEmpresa: data.asesorEmpresaNombre || 'Por asignar',
            asesorAcademico: data.asesorAcademico ? {
              nombre: `${data.asesorAcademico.nombre} ${data.asesorAcademico.apellidoPaterno || ''}`,
              email: data.asesorAcademico.email || '',
            } : undefined,
            horasRegistradas: data.seguimiento?.map((s: any, idx: number) => ({
              id: s.id || idx,
              fecha: s.fecha,
              horas: s.horas,
              actividad: s.actividad || 'Actividad registrada',
              aprobadoEmpresa: s.aprobadoEmpresa || false,
              aprobadoAsesor: s.aprobadoAsesor || false,
            })) || [],
            informes: data.informes?.map((r: any, idx: number) => ({
              id: r.id || idx,
              tipo: r.tipo === 'final' ? 'final' : 'parcial',
              titulo: r.titulo || `Informe ${idx + 1}`,
              fechaEntrega: r.fechaEntrega || r.creadoEn,
              estado: r.estado || 'pendiente',
              comentarioAsesor: r.comentarioAsesor,
            })) || [],
            tipo: 'practica',
          };
          setPractica(practiceData);
        } else {
          setPractica(null);
        }
      }
      setIsLoading(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo cargar la práctica',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      toast({
        title: 'Práctica eliminada',
        description: 'La práctica fue eliminada exitosamente.',
      });
      router.push('/student/practicas');
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la práctica.',
        variant: 'destructive',
      });
    }
  };

  const handleAddHours = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Horas registradas',
        description: `Se registraron ${hoursForm.horas} horas exitosamente.`,
      });
      
      setShowHoursModal(false);
      setHoursForm({ fecha: new Date().toISOString().split('T')[0], horas: '', actividad: '' });
      loadPractica();
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudieron registrar las horas.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Informe enviado',
        description: `${reportForm.titulo} fue enviado para revisión.`,
      });
      
      setShowReportModal(false);
      setReportForm({ tipo: 'parcial', titulo: '', contenido: '' });
      loadPractica();
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el informe.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'observado':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return 'Aprobado';
      case 'observado':
        return 'Observado';
      default:
        return 'Pendiente';
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!practica) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Práctica no encontrada"
        description="La práctica que buscas no existe o no tienes acceso a ella."
        action={{
          label: 'Volver a mis prácticas',
          onClick: () => router.push('/student/practicas'),
        }}
      />
    );
  }

  const progreso = Math.round((practica.horasCompletadas / practica.horasTotales) * 100);
  const pendingReports = practica.informes.filter(r => r.estado === 'pendiente').length;
  const approvedHours = practica.horasRegistradas.filter(h => h.aprobadoEmpresa && h.aprobadoAsesor).reduce((acc, h) => acc + h.horas, 0);
  const pendingHours = practica.horasRegistradas.filter(h => !h.aprobadoEmpresa || !h.aprobadoAsesor).reduce((acc, h) => acc + h.horas, 0);

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
              Volver a mis prácticas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">{practica.cargo}</h1>
          <p className="text-muted-foreground mt-1">{practica.empresa}</p>
          {practica.tipo === 'postulacion' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                Postulación Aprobada
              </span>
              <span className="text-xs text-muted-foreground">
                Postuló: {practica.fechaPostulacion ? new Date(practica.fechaPostulacion).toLocaleDateString('es-ES') : ''}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {practica.tipo === 'practica' && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/student/practicas/${params.id}/editar`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            </>
          )}
          {practica.tipo === 'postulacion' && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/student/practicas/postulaciones">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Ver postulaciones
              </Link>
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{practica.horasCompletadas}</p>
              <p className="text-xs text-muted-foreground">de {practica.horasTotales}h</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{approvedHours}</p>
              <p className="text-xs text-muted-foreground">Horas aprobadas</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">{pendingHours}</p>
              <p className="text-xs text-muted-foreground">Por aprobar</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <FileText className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingReports}</p>
              <p className="text-xs text-muted-foreground">Informes pendientes</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* Progress Card */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Progreso de la práctica</h3>
              <StatusBadge variant={practica.estado === 'activa' ? 'active' : 'completed'}>
                {practica.estado === 'activa' ? 'En curso' : 'Finalizada'}
              </StatusBadge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completado</span>
                <span className="font-medium text-foreground">{progreso}%</span>
              </div>
              <Progress value={progreso} className="h-2" />
            </div>
          </div>

          {/* Asesor Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Información del Asesor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Asesor Académico</p>
                <p className="font-medium text-foreground">{practica.asesorAcademico?.nombre || 'Por asignar'}</p>
                {practica.asesorAcademico?.email && (
                  <p className="text-sm text-muted-foreground mt-1">{practica.asesorAcademico.email}</p>
                )}
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Supervisor de Empresa</p>
                <p className="font-medium text-foreground">{practica.supervisorEmpresa}</p>
              </div>
            </div>
          </div>

          {/* Hours Tracking */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <History className="w-4 h-4" />
                Registro de Horas
              </h3>
              <Button size="sm" onClick={() => setShowHoursModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar horas
              </Button>
            </div>
            
            {practica.horasRegistradas.length > 0 ? (
              <div className="space-y-2">
                {practica.horasRegistradas.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        entry.aprobadoEmpresa && entry.aprobadoAsesor 
                          ? 'bg-emerald-500' 
                          : 'bg-amber-500'
                      }`} />
                      <div>
                        <p className="font-medium text-foreground text-sm">{entry.actividad}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(entry.fecha)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{entry.horas}h</span>
                      <div className="flex gap-1">
                        <span className={`text-xs px-2 py-1 rounded ${
                          entry.aprobadoEmpresa 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-500/20'
                        }`}>
                          Empresa
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          entry.aprobadoAsesor 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-500/20'
                        }`}>
                          Asesor
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No hay horas registradas aún</p>
            )}
          </div>

          {/* Reports */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Informes y Entregables
              </h3>
              <Button size="sm" onClick={() => setShowReportModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Subir informe
              </Button>
            </div>
            
            <div className="space-y-2">
              {practica.informes.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-lg border ${
                    report.estado === 'observado' 
                      ? 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/10' 
                      : 'border-border bg-muted/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(report.estado)}
                      <div>
                        <p className="font-medium text-foreground">{report.titulo}</p>
                        <p className="text-xs text-muted-foreground">
                          {report.tipo === 'final' ? 'Informe Final' : 'Informe Parcial'}
                          {report.fechaEntrega && ` • Entregado: ${formatDate(report.fechaEntrega)}`}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      report.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                      report.estado === 'observado' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                      'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                    }`}>
                      {getStatusText(report.estado)}
                    </span>
                  </div>
                  {report.comentarioAsesor && (
                    <div className="mt-3 p-3 bg-background rounded border border-border">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Comentario del asesor:</p>
                      <p className="text-sm text-foreground">{report.comentarioAsesor}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Descripción de actividades
            </h3>
            <p className="text-muted-foreground">{practica.descripcion}</p>
          </div>
        </motion.div>

        {/* Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Period Info */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Periodo
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de inicio</p>
                <p className="font-medium text-foreground">{formatDate(practica.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fecha de fin</p>
                <p className="font-medium text-foreground">{formatDate(practica.fechaFin)}</p>
              </div>
              <div className="pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">Días restantes</p>
                <p className="font-medium text-foreground">
                  {Math.max(0, Math.ceil((new Date(practica.fechaFin).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} días
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-semibold text-foreground mb-4">Acciones rápidas</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-between" onClick={() => setShowHoursModal(true)}>
                Registrar horas
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => setShowReportModal(true)}>
                Subir informe
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Solicitar constancia
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between">
                Contactar asesor
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Eliminar práctica</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas eliminar esta práctica? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Eliminar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Hours Modal */}
      <AnimatePresence>
        {showHoursModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowHoursModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <form onSubmit={handleAddHours} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Registrar horas</h3>
                  <p className="text-muted-foreground text-sm mt-1">Registra las horas trabajadas</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={hoursForm.fecha}
                    onChange={(e) => setHoursForm(prev => ({ ...prev, fecha: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horas">Horas trabajadas</Label>
                  <Input
                    id="horas"
                    type="number"
                    min="1"
                    max="12"
                    placeholder="Ej: 8"
                    value={hoursForm.horas}
                    onChange={(e) => setHoursForm(prev => ({ ...prev, horas: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actividad">Descripción de actividades</Label>
                  <Textarea
                    id="actividad"
                    placeholder="Describe las actividades realizadas..."
                    rows={3}
                    value={hoursForm.actividad}
                    onChange={(e) => setHoursForm(prev => ({ ...prev, actividad: e.target.value }))}
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowHoursModal(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Registrar'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowReportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            >
              <form onSubmit={handleSubmitReport} className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Subir informe</h3>
                  <p className="text-muted-foreground text-sm mt-1">Envía tu informe mensual o final</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de informe</Label>
                  <select
                    id="tipo"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                    value={reportForm.tipo}
                    onChange={(e) => setReportForm(prev => ({ ...prev, tipo: e.target.value as 'parcial' | 'final' }))}
                    required
                  >
                    <option value="parcial">Informe Parcial (Mensual)</option>
                    <option value="final">Informe Final</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="titulo">Título del informe</Label>
                  <Input
                    id="titulo"
                    placeholder="Ej: Informe Mensual - Marzo 2024"
                    value={reportForm.titulo}
                    onChange={(e) => setReportForm(prev => ({ ...prev, titulo: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contenido">Resumen de actividades</Label>
                  <Textarea
                    id="contenido"
                    placeholder="Describe las actividades realizadas..."
                    rows={5}
                    value={reportForm.contenido}
                    onChange={(e) => setReportForm(prev => ({ ...prev, contenido: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Documento adjunto (opcional)
                  </Label>
                  <Input type="file" accept=".pdf,.doc,.docx" />
                  <p className="text-xs text-muted-foreground">Formatos permitidos: PDF, Word</p>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowReportModal(false)} disabled={isSubmitting}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Enviar informe'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
