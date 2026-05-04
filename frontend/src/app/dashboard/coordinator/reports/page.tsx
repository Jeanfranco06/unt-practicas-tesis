'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Briefcase,
  BookOpen,
  Users,
  Building2,
  GraduationCap,
  TrendingUp,
  Filter,
  Calendar,
  ChevronDown,
  ChevronRight,
  BarChart3,
  PieChart,
  CheckCircle,
  Clock,
  AlertTriangle,
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

// Reportes específicos para Coordinador de Facultad
const reportesFacultad = [
  {
    id: 'practicas',
    title: 'Reporte de Prácticas',
    description: 'Lista detallada de estudiantes en prácticas con información de empresas y asesores',
    icon: Briefcase,
    color: 'bg-blue-500',
    endpoint: '/api/reports/faculty/pdf/internships',
    formato: 'pdf',
  },
  {
    id: 'tesis',
    title: 'Reporte de Tesis',
    description: 'Seguimiento de proyectos de tesis con estados y asignaciones de asesores',
    icon: BookOpen,
    color: 'bg-purple-500',
    endpoint: '/api/reports/faculty/pdf/thesis',
    formato: 'pdf',
  },
  {
    id: 'estudiantes',
    title: 'Reporte de Estudiantes',
    description: 'Información completa de estudiantes inscritos en la facultad',
    icon: GraduationCap,
    color: 'bg-emerald-500',
    endpoint: '/api/reports/faculty/pdf/students',
    formato: 'pdf',
  },
  {
    id: 'asesores',
    title: 'Reporte de Asesores',
    description: 'Lista de docentes asesores con su carga asignada y especialidades',
    icon: Users,
    color: 'bg-orange-500',
    endpoint: '/api/reports/faculty/pdf/advisors',
    formato: 'pdf',
  },
  {
    id: 'convenios',
    title: 'Reporte de Convenios',
    description: 'Convenios vigentes con empresas y fechas de vencimiento',
    icon: Building2,
    color: 'bg-cyan-500',
    endpoint: '/api/reports/faculty/pdf/agreements',
    formato: 'pdf',
  },
  {
    id: 'estadisticas',
    title: 'Reporte de Estadísticas',
    description: 'Resumen estadístico completo de todas las actividades de la facultad',
    icon: BarChart3,
    color: 'bg-indigo-500',
    endpoint: '/api/reports/faculty/pdf/stats',
    formato: 'pdf',
  },
];

export default function CoordinatorReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalActivePractices: 0,
    totalThesisInDevelopment: 0,
    totalActiveAgreements: 0,
    totalStudentsInPractice: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const fetchFacultyStats = async () => {
    try {
      setIsLoadingStats(true);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
      
      // Fetch both stats and agreements data
      const [statsResponse, agreementsResponse] = await Promise.all([
        fetch(`${API_URL}/api/reports/faculty/stats`, { headers }),
        fetch(`${API_URL}/api/reports/faculty/agreements`, { headers }),
      ]);

      // Handle stats response
      if (!statsResponse.ok) {
        const errorText = await statsResponse.text();
        console.error('Stats API error:', statsResponse.status, errorText);
        throw new Error(`Error ${statsResponse.status}: ${errorText || 'Error al cargar estadísticas'}`);
      }

      const statsData = await statsResponse.json();
      console.log('Stats data received:', statsData);
      
      // Get agreements data if available
      let activeAgreements = 0;
      if (agreementsResponse.ok) {
        try {
          const agreementsData = await agreementsResponse.json();
          console.log('Agreements data received:', agreementsData);
          // Count active agreements (vigentes)
          activeAgreements = agreementsData.items?.filter((agreement: any) => 
            agreement.estado === 'vigente' || agreement.alerta !== 'vencido'
          ).length || 0;
        } catch (err) {
          console.warn('Failed to parse agreements data:', err);
        }
      } else {
        console.warn('Agreements API error:', agreementsResponse.status);
      }
      
      // Extract the required statistics from the response
      const newStats = {
        totalActivePractices: statsData.practicas?.porEstado?.ACTIVA || 
                             statsData.practicas?.porEstado?.activa || 0,
        totalThesisInDevelopment: statsData.tesis?.porEstado?.EN_DESARROLLO || 
                                 statsData.tesis?.porEstado?.en_desarrollo || 0,
        totalActiveAgreements: activeAgreements,
        totalStudentsInPractice: statsData.estudiantes?.enPractica || 0,
      };
      
      console.log('Setting stats:', newStats);
      setStats(newStats);
    } catch (err: any) {
      console.error('Error fetching faculty stats:', err);
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar las estadísticas',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchFacultyStats();
  }, []);

  const handleDownload = async (report: typeof reportesFacultad[0]) => {
    try {
      setDownloadingId(report.id);

      const params = new URLSearchParams();
      if (dateRange.start) params.append('startDate', dateRange.start);
      if (dateRange.end) params.append('endDate', dateRange.end);

      const response = await fetch(`${API_URL}${report.endpoint}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al generar el reporte');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${report.id}_${new Date().toISOString().split('T')[0]}.${report.formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Reporte descargado',
        description: `${report.title} se descargó correctamente`,
        variant: 'default',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo descargar el reporte',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-xl">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard de Reportes
            </h1>
            <p className="text-muted-foreground text-lg">
              Visualización y análisis de datos de tu facultad
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filtros de Fecha */}
      <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Rango de fechas:</span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-40"
              placeholder="Fecha inicio"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-40"
              placeholder="Fecha fin"
            />
          </div>
        </div>
      </motion.div>

      {/* Reportes Grid */}
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            Reportes Disponibles
          </h2>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchFacultyStats}
            disabled={isLoadingStats}
            className="gap-2"
          >
            <CheckCircle className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            {isLoadingStats ? 'Actualizando...' : 'Actualizar Datos'}
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportesFacultad.map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Header with icon */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${report.color.replace('bg-', 'from-').replace('500', '500 to-600')} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                  <report.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground text-lg group-hover:text-primary transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              </div>

              {/* Action section */}
              <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-1 bg-muted rounded-full">
                  <FileText className="w-3 h-3" />
                  <span className="uppercase font-medium">{report.formato}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(report)}
                  disabled={downloadingId === report.id}
                  className="gap-2 shadow-sm hover:shadow-md transition-shadow"
                >
                  {downloadingId === report.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Resumen Rápido - Statistics Cards */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Resumen General
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Prácticas Activas', 
              value: isLoadingStats ? '...' : stats.totalActivePractices, 
              color: 'from-blue-500 to-blue-600', 
              bgColor: 'bg-blue-500/10',
              icon: Briefcase,
              description: 'Estudiantes en prácticas actualmente'
            },
            { 
              label: 'Tesis en Desarrollo', 
              value: isLoadingStats ? '...' : stats.totalThesisInDevelopment, 
              color: 'from-purple-500 to-purple-600',
              bgColor: 'bg-purple-500/10',
              icon: BookOpen,
              description: 'Proyectos de tesis en curso'
            },
            { 
              label: 'Estudiantes en Prácticas', 
              value: isLoadingStats ? '...' : stats.totalStudentsInPractice, 
              color: 'from-emerald-500 to-emerald-600',
              bgColor: 'bg-emerald-500/10',
              icon: GraduationCap,
              description: 'Total de estudiantes activos'
            },
            { 
              label: 'Convenios Vigentes', 
              value: isLoadingStats ? '...' : stats.totalActiveAgreements, 
              color: 'from-cyan-500 to-cyan-600',
              bgColor: 'bg-cyan-500/10',
              icon: Building2,
              description: 'Acuerdos con empresas activos'
            },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.02, y: -2 }}
              className="relative overflow-hidden bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all duration-300"
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              
              {/* Content */}
              <div className="relative space-y-4">
                {/* Icon */}
                <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} text-transparent bg-clip-text`} />
                </div>
                
                {/* Value */}
                <div className="space-y-1">
                  <p className="text-3xl font-bold bg-gradient-to-br text-transparent bg-clip-text">
                    {isLoadingStats ? (
                      <div className="w-16 h-8 bg-muted rounded-lg animate-pulse" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Información y Ayuda */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nota informativa */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Información Importante</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                Los reportes muestran información filtrada según tu facultad/escuela asignada. 
                Los datos se actualizan en tiempo real y reflejan el estado actual del sistema.
              </p>
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                <Clock className="w-3 h-3" />
                <span>Última actualización: {new Date().toLocaleTimeString('es-ES')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ayuda y Soporte */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Ayuda y Soporte</h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                Si encuentras algún error o necesitas reportes adicionales, 
                contacta al administrador del sistema o utiliza el botón de actualizar datos.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchFacultyStats}
                disabled={isLoadingStats}
                className="mt-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                Reintentar Carga de Datos
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
