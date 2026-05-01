'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Briefcase,
  BookOpen,
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  Building2,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  ChevronDown,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

// Reportes de Operación (Día a día)
const reportesOperacion = [
  {
    id: 'practicas-en-curso',
    title: 'Prácticas en Curso',
    description: 'Estudiantes en prácticas activas, horas y progreso',
    icon: Briefcase,
    color: 'bg-blue-500',
    endpoint: '/api/reports/operacion/practicas-en-curso',
    pdfEndpoint: '/api/reports/pdf/practicas-en-curso',
  },
  {
    id: 'postulaciones',
    title: 'Postulaciones',
    description: 'Ofertas y postulantes por estado',
    icon: Users,
    color: 'bg-emerald-500',
    endpoint: '/api/reports/operacion/postulaciones',
    pdfEndpoint: '/api/reports/pdf/postulaciones',
  },
  {
    id: 'seguimiento-tesis',
    title: 'Seguimiento de Tesis',
    description: 'Tesis en proceso con entregables pendientes',
    icon: BookOpen,
    color: 'bg-purple-500',
    endpoint: '/api/reports/operacion/seguimiento-tesis',
    pdfEndpoint: '/api/reports/pdf/seguimiento-tesis',
  },
  {
    id: 'evaluaciones',
    title: 'Evaluaciones',
    description: 'Entregables revisados y pendientes',
    icon: CheckCircle,
    color: 'bg-amber-500',
    endpoint: '/api/reports/operacion/evaluaciones',
    pdfEndpoint: '/api/reports/pdf/evaluaciones',
  },
  {
    id: 'sustentaciones',
    title: 'Sustentaciones',
    description: 'Defensas programadas con jurados',
    icon: Calendar,
    color: 'bg-indigo-500',
    endpoint: '/api/reports/operacion/sustentaciones',
    pdfEndpoint: '/api/reports/pdf/sustentaciones',
  },
  {
    id: 'convenios',
    title: 'Convenios Activos',
    description: 'Convenios vigentes y fechas de vencimiento',
    icon: Building2,
    color: 'bg-cyan-500',
    endpoint: '/api/reports/operacion/convenios',
    pdfEndpoint: '/api/reports/pdf/convenios',
  },
  {
    id: 'alertas',
    title: 'Alertas Operativas',
    description: 'Convenios por vencer, sin avance, fuera de plazo',
    icon: AlertTriangle,
    color: 'bg-red-500',
    endpoint: '/api/reports/operacion/alertas',
    pdfEndpoint: '/api/reports/pdf/alertas',
  },
];

// Reportes de Gestión (Estratégicos)
const reportesGestion = [
  {
    id: 'indicadores-generales',
    title: 'Indicadores Generales',
    description: 'Visión global del sistema',
    icon: BarChart3,
    color: 'bg-slate-600',
    endpoint: '/api/reports/gestion/indicadores-generales',
    pdfEndpoint: '/api/reports/pdf/indicadores-generales',
  },
  {
    id: 'rendimiento-practicas',
    title: 'Rendimiento de Prácticas',
    description: '% colocación y tiempo promedio',
    icon: TrendingUp,
    color: 'bg-green-600',
    endpoint: '/api/reports/gestion/rendimiento-practicas',
    pdfEndpoint: '/api/reports/pdf/rendimiento-practicas',
  },
  {
    id: 'participacion-empresas',
    title: 'Participación de Empresas',
    description: 'Empresas más activas',
    icon: Building2,
    color: 'bg-blue-600',
    endpoint: '/api/reports/gestion/participacion-empresas',
    pdfEndpoint: '/api/reports/pdf/participacion-empresas',
  },
  {
    id: 'rendimiento-tesis',
    title: 'Rendimiento de Tesis',
    description: '% aprobadas/rechazadas',
    icon: GraduationCap,
    color: 'bg-purple-600',
    endpoint: '/api/reports/gestion/rendimiento-tesis',
    pdfEndpoint: '/api/reports/pdf/rendimiento-tesis',
  },
  {
    id: 'desempeno-asesores',
    title: 'Desempeño de Asesores',
    description: 'Carga por docente',
    icon: Users,
    color: 'bg-orange-600',
    endpoint: '/api/reports/gestion/desempeno-asesores',
    pdfEndpoint: '/api/reports/pdf/desempeno-asesores',
  },
  {
    id: 'cumplimiento-plazos',
    title: 'Cumplimiento de Plazos',
    description: 'Entregas a tiempo vs retrasadas',
    icon: Clock,
    color: 'bg-teal-600',
    endpoint: '/api/reports/gestion/cumplimiento-plazos',
    pdfEndpoint: '/api/reports/pdf/cumplimiento-plazos',
  },
  {
    id: 'evolucion-temporal',
    title: 'Evolución Temporal',
    description: 'Prácticas y tesis por periodo',
    icon: Activity,
    color: 'bg-pink-600',
    endpoint: '/api/reports/gestion/evolucion-temporal',
    pdfEndpoint: '/api/reports/pdf/evolucion-temporal',
  },
  {
    id: 'estado-convenios',
    title: 'Estado de Convenios',
    description: 'Activos vs vencidos',
    icon: PieChart,
    color: 'bg-cyan-600',
    endpoint: '/api/reports/gestion/estado-convenios',
    pdfEndpoint: '/api/reports/pdf/estado-convenios',
  },
];

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

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'operacion' | 'gestion'>('operacion');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const currentReports = activeTab === 'operacion' ? reportesOperacion : reportesGestion;

  const loadReport = async (report: (typeof currentReports)[0]) => {
    try {
      setIsLoading(true);
      setSelectedReport(report.id);
      
      const queryParams = new URLSearchParams();
      if (filters.fechaDesde) queryParams.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) queryParams.append('fechaHasta', filters.fechaHasta);
      if (filters.estado) queryParams.append('estado', filters.estado);
      
      const url = `${report.endpoint}?${queryParams.toString()}`;
      const data = await fetchWithAuth(url);
      setReportData(data);
    } catch (err: any) {
      toast({
        title: 'Error al cargar reporte',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!selectedReport) return;

    const report = currentReports.find(r => r.id === selectedReport);
    if (!report?.pdfEndpoint) return;

    try {
      const token = localStorage.getItem('accessToken');
      const queryParams = new URLSearchParams();
      if (filters.fechaDesde) queryParams.append('fechaDesde', filters.fechaDesde);
      if (filters.fechaHasta) queryParams.append('fechaHasta', filters.fechaHasta);
      if (filters.estado) queryParams.append('estado', filters.estado);

      const response = await fetch(`${API_URL}${report.pdfEndpoint}?${queryParams.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!response.ok) throw new Error('Error al descargar PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast({ title: 'PDF descargado exitosamente' });
    } catch (err: any) {
      toast({
        title: 'Error al descargar PDF',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Reportes operativos y de gestión para toma de decisiones
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <button
          onClick={() => {
            setActiveTab('operacion');
            setSelectedReport(null);
            setReportData(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'operacion'
              ? 'bg-blue-500 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Activity className="w-4 h-4 inline mr-2" />
          Operación (Día a día)
        </button>
        <button
          onClick={() => {
            setActiveTab('gestion');
            setSelectedReport(null);
            setReportData(null);
          }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'gestion'
              ? 'bg-slate-600 text-white'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Gestión (Estratégicos)
        </button>
      </motion.div>

      {/* Filtros */}
      <motion.div variants={itemVariants}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filtros
          {showFilters ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-4 bg-muted/50 rounded-lg grid sm:grid-cols-3 gap-3"
          >
            <div>
              <label className="text-xs text-muted-foreground">Fecha Desde</label>
              <Input
                type="date"
                value={filters.fechaDesde}
                onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
                className="mt-1 bg-background text-foreground border-input dark:bg-background dark:text-foreground dark:border-border"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Fecha Hasta</label>
              <Input
                type="date"
                value={filters.fechaHasta}
                onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
                className="mt-1 bg-background text-foreground border-input dark:bg-background dark:text-foreground dark:border-border"
              />
            </div>
            {/* Filtro de estado dinámico según el reporte seleccionado */}
            {selectedReport && (
              <div>
                <label className="text-xs text-muted-foreground">
                  {selectedReport?.includes('practica') || selectedReport === 'rendimiento-practicas' || selectedReport === 'participacion-empresas' || selectedReport === 'convenios' || selectedReport === 'alertas'
                    ? 'Estado Práctica'
                    : selectedReport?.includes('tesis') || selectedReport === 'seguimiento-tesis' || selectedReport === 'rendimiento-tesis' || selectedReport === 'desempeno-asesores' || selectedReport === 'evaluaciones' || selectedReport === 'cumplimiento-plazos'
                    ? 'Estado Tesis'
                    : selectedReport === 'postulaciones'
                    ? 'Estado Postulación'
                    : selectedReport === 'sustentaciones'
                    ? 'Estado Sustentación'
                    : 'Estado'}
                </label>
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                  className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 text-foreground dark:bg-background dark:text-foreground dark:border-border"
                >
                  <option value="">Todos</option>
                  {/* Estados de Prácticas */}
                  {(selectedReport?.includes('practica') || selectedReport === 'rendimiento-practicas' || selectedReport === 'alertas') && (
                    <>
                      <option value="activa">Activa</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="en_evaluacion">En Evaluación</option>
                      <option value="pendiente_asignacion">Pendiente Asignación</option>
                      <option value="cancelada">Cancelada</option>
                    </>
                  )}
                  {/* Estados de Tesis */}
                  {(selectedReport?.includes('tesis') || selectedReport === 'desempeno-asesores' || selectedReport === 'evaluaciones' || selectedReport === 'cumplimiento-plazos') && (
                    <>
                      <option value="en_registro">En Registro</option>
                      <option value="propuesto">Propuesto</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="en_desarrollo">En Desarrollo</option>
                      <option value="en_revision">En Revisión</option>
                      <option value="culminado">Culminado</option>
                      <option value="desaprobado">Desaprobado</option>
                      <option value="cancelado">Cancelado</option>
                    </>
                  )}
                  {/* Estados de Postulaciones */}
                  {selectedReport === 'postulaciones' && (
                    <>
                      <option value="postulado">Postulado</option>
                      <option value="preseleccionado">Preseleccionado</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="rechazado">Rechazado</option>
                    </>
                  )}
                  {/* Estados de Sustentaciones */}
                  {selectedReport === 'sustentaciones' && (
                    <>
                      <option value="pendiente">Pendiente</option>
                      <option value="aprobado">Aprobado</option>
                      <option value="desaprobado">Desaprobado</option>
                      <option value="observado">Observado</option>
                    </>
                  )}
                  {/* Estados de Convenios */}
                  {(selectedReport?.includes('convenio') || selectedReport === 'convenios') && (
                    <>
                      <option value="vigente">Vigente</option>
                      <option value="vencido">Vencido</option>
                      <option value="por_vencer">Por Vencer</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Grid de Reportes */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentReports.map((report) => (
          <button
            key={report.id}
            onClick={() => loadReport(report)}
            className={`p-4 rounded-xl border text-left transition-all hover:shadow-md ${
              selectedReport === report.id
                ? 'bg-card border-blue-500/50 ring-1 ring-blue-500/30'
                : 'bg-card border-border hover:border-border/60'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 ${report.color} rounded-lg`}>
                <report.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{report.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {report.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Visualización de Datos */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 text-center"
        >
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm mt-2">Cargando reporte...</p>
        </motion.div>
      )}

      {reportData && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Resumen en tarjetas - valores simples */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(reportData)
              .filter(([key, value]) => {
                // Solo mostrar valores simples (no objetos/arrays)
                const isComplex = typeof value === 'object' && value !== null;
                const isExcluded = ['items', 'porEstado', 'porMes', 'porTipo', 'asesores', 'ofertas', 'conveniosPorEmpresa', 'topEmpresas', 'itemsPendientes', 'conveniosPorVencer', 'estudiantesSinAvance', 'entregasFueraDePlazo', 'practicas', 'tesis', 'convenios', 'empresas', 'estudiantes', 'porArea', 'indicadores'].includes(key);
                return !isComplex && !isExcluded;
              })
              .slice(0, 4)
              .map(([key, value]) => (
                <div key={key} className="p-4 bg-card rounded-xl border border-border">
                  <p className="text-xs text-muted-foreground uppercase">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-1">
                    {typeof value === 'number' ? value.toLocaleString() : String(value)}
                  </p>
                </div>
              ))}
          </div>

          {/* Resumen de objetos anidados - Alertas y similares */}
          {(reportData.conveniosPorVencer || reportData.estudiantesSinAvance || reportData.entregasFueraDePlazo) && (
            <div className="grid sm:grid-cols-3 gap-4">
              {reportData.conveniosPorVencer && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Convenios Por Vencer</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{reportData.conveniosPorVencer.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">requieren atención</p>
                </div>
              )}
              {reportData.estudiantesSinAvance && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Sin Avance</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{reportData.estudiantesSinAvance.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">estudiantes estancados</p>
                </div>
              )}
              {reportData.entregasFueraDePlazo && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm font-medium text-foreground">Fuera de Plazo</span>
                  </div>
                  <p className="text-3xl font-bold text-foreground">{reportData.entregasFueraDePlazo.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">entregas atrasadas</p>
                </div>
              )}
            </div>
          )}

          {/* Indicadores Generales con Gráficos de Progreso */}
          {reportData.practicas && (
            <div className="p-5 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  Prácticas
                </h3>
                <span className="text-2xl font-bold">{reportData.practicas.total || 0}</span>
              </div>
              {/* Barra de progreso stacked */}
              <div className="h-4 bg-muted rounded-full overflow-hidden flex mb-3">
                <div 
                  className="h-full bg-green-500 transition-all" 
                  style={{ width: `${(reportData.practicas.activas / reportData.practicas.total) * 100 || 0}%` }}
                />
                <div 
                  className="h-full bg-blue-500 transition-all" 
                  style={{ width: `${(reportData.practicas.finalizadas / reportData.practicas.total) * 100 || 0}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">Activas:</span>
                  <span className="font-semibold text-foreground">{reportData.practicas.activas || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Finalizadas:</span>
                  <span className="font-semibold text-foreground">{reportData.practicas.finalizadas || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">% Finalización:</span>
                  <span className="font-semibold text-green-600">{reportData.practicas.porcentajeFinalizadas || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {reportData.tesis && (
            <div className="p-5 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  Tesis
                </h3>
                <span className="text-2xl font-bold">{reportData.tesis.total || 0}</span>
              </div>
              {/* Barra de progreso stacked */}
              <div className="h-4 bg-muted rounded-full overflow-hidden flex mb-3">
                <div 
                  className="h-full bg-purple-500 transition-all" 
                  style={{ width: `${(reportData.tesis.activas / reportData.tesis.total) * 100 || 0}%` }}
                />
                <div 
                  className="h-full bg-emerald-500 transition-all" 
                  style={{ width: `${(reportData.tesis.finalizadas / reportData.tesis.total) * 100 || 0}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-muted-foreground">Activas:</span>
                  <span className="font-semibold text-foreground">{reportData.tesis.activas || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Finalizadas:</span>
                  <span className="font-semibold text-foreground">{reportData.tesis.finalizadas || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">% Finalización:</span>
                  <span className="font-semibold text-purple-600">{reportData.tesis.porcentajeFinalizadas || 0}%</span>
                </div>
              </div>
            </div>
          )}

          {reportData.estudiantes && (
            <div className="p-5 bg-card rounded-xl border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-500" />
                  Estudiantes
                </h3>
                <span className="text-2xl font-bold">{reportData.estudiantes.total || 0}</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-foreground">{reportData.estudiantes.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{reportData.estudiantes.enPractica || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">En Práctica</p>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${(reportData.estudiantes.enPractica / reportData.estudiantes.total) * 100 || 0}%` }}
                    />
                  </div>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-600">{reportData.estudiantes.enTesis || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">En Tesis</p>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full" 
                      style={{ width: `${(reportData.estudiantes.enTesis / reportData.estudiantes.total) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Distribución por Estado - Gráfico de Barras Horizontales */}
          {reportData.porEstado && Object.keys(reportData.porEstado).length > 0 && (
            <div className="p-5 bg-card rounded-xl border border-border">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-500" />
                Distribución por Estado
              </h3>
              <div className="space-y-3">
                {Object.entries(reportData.porEstado as Record<string, number>)
                  .sort(([, a], [, b]) => b - a)
                  .map(([estado, cantidad]) => {
                    const total = Object.values(reportData.porEstado as Record<string, number>).reduce((a, b) => a + b, 0) || 1;
                    const porcentaje = (cantidad / total) * 100;
                    const colorClass = 
                      estado.includes('aproba') || estado === 'activa' || estado === 'culminado' ? 'bg-green-500' :
                      estado.includes('rechaz') || estado.includes('desaproba') || estado === 'cancelada' ? 'bg-red-500' :
                      estado.includes('observ') || estado === 'en_revision' ? 'bg-amber-500' :
                      estado === 'en_desarrollo' || estado === 'en_evaluacion' ? 'bg-blue-500' :
                      'bg-slate-500';
                    return (
                      <div key={estado} className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground w-28 capitalize truncate">{estado.replace(/_/g, ' ')}</span>
                        <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colorClass} flex items-center justify-end px-2 transition-all`}
                            style={{ width: `${porcentaje}%`, minWidth: porcentaje > 0 ? '2rem' : '0' }}
                          >
                            {porcentaje > 15 && <span className="text-xs text-white font-medium">{cantidad}</span>}
                          </div>
                        </div>
                        <span className="text-sm font-medium w-12 text-right">{porcentaje.toFixed(1)}%</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Métricas de Rendimiento con Indicadores Visuales */}
          {(reportData.tasaColocacion !== undefined || reportData.tasaAprobacion !== undefined || reportData.tasaCumplimiento !== undefined) && (
            <div className="grid sm:grid-cols-3 gap-4">
              {reportData.tasaColocacion !== undefined && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Tasa Colocación</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{reportData.tasaColocacion}%</span>
                    <span className="text-xs text-muted-foreground">practicantes</span>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: `${reportData.tasaColocacion}%` }} />
                  </div>
                </div>
              )}
              {reportData.tasaAprobacion !== undefined && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Tasa Aprobación</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{reportData.tasaAprobacion}%</span>
                    <span className="text-xs text-muted-foreground">aprobados</span>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" style={{ width: `${reportData.tasaAprobacion}%` }} />
                  </div>
                </div>
              )}
              {reportData.tasaCumplimiento !== undefined && (
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Cumplimiento Plazos</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">{reportData.tasaCumplimiento}%</span>
                    <span className="text-xs text-muted-foreground">a tiempo</span>
                  </div>
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: `${reportData.tasaCumplimiento}%` }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={downloadPDF}
              variant="outline"
              className="border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
              disabled={!selectedReport}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar PDF
            </Button>
          </div>

          {/* Detalle expandible */}
          {reportData.items && reportData.items.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-foreground">Detalle</h3>
                <p className="text-xs text-muted-foreground">
                  {reportData.items.length} registros encontrados
                </p>
              </div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      {Object.keys(reportData.items[0]).slice(0, 5).map((key) => (
                        <th key={key} className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportData.items.slice(0, 10).map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/30">
                        {Object.values(item).slice(0, 5).map((val: any, i) => (
                          <td key={i} className="px-4 py-2 text-foreground">
                            {typeof val === 'boolean' 
                              ? val ? 'Sí' : 'No'
                              : typeof val === 'object' 
                                ? JSON.stringify(val).slice(0, 30)
                                : String(val).slice(0, 50)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
