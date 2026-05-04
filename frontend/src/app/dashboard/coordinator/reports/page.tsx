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
    id: 'practicas-facultad',
    title: 'Prácticas de la Facultad',
    description: 'Estudiantes en prácticas de su facultad/escuela',
    icon: Briefcase,
    color: 'bg-blue-500',
    endpoint: '/api/reports/faculty/internships',
    formato: 'pdf',
  },
  {
    id: 'tesis-facultad',
    title: 'Tesis de la Facultad',
    description: 'Proyectos de tesis en desarrollo y aprobados',
    icon: BookOpen,
    color: 'bg-purple-500',
    endpoint: '/api/reports/faculty/thesis',
    formato: 'pdf',
  },
  {
    id: 'estudiantes-facultad',
    title: 'Estudiantes Activos',
    description: 'Listado de estudiantes con prácticas o tesis activas',
    icon: GraduationCap,
    color: 'bg-emerald-500',
    endpoint: '/api/reports/faculty/students',
    formato: 'pdf',
  },
  {
    id: 'docentes-facultad',
    title: 'Docentes y Asesores',
    description: 'Asesores asignados y su carga académica',
    icon: Users,
    color: 'bg-amber-500',
    endpoint: '/api/reports/faculty/advisors',
    formato: 'pdf',
  },
  {
    id: 'convenios-facultad',
    title: 'Convenios de la Facultad',
    description: 'Empresas colaboradoras y convenios vigentes',
    icon: Building2,
    color: 'bg-cyan-500',
    endpoint: '/api/reports/faculty/agreements',
    formato: 'pdf',
  },
  {
    id: 'estadisticas-facultad',
    title: 'Estadísticas Generales',
    description: 'Resumen estadístico de procesos en la facultad',
    icon: BarChart3,
    color: 'bg-indigo-500',
    endpoint: '/api/reports/faculty/stats',
    formato: 'pdf',
  },
];

export default function CoordinatorReportsPage() {
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Reportes de Facultad
        </h1>
        <p className="text-muted-foreground">
          Genera reportes específicos de los procesos en tu facultad/escuela
        </p>
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
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-primary" />
          Reportes Disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportesFacultad.map((report) => (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-elevated transition-all"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <report.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="uppercase">{report.formato}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(report)}
                  disabled={downloadingId === report.id}
                  className="gap-2"
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

      {/* Resumen Rápido */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Prácticas Activas', value: '-', color: 'text-blue-600', icon: Briefcase },
          { label: 'Tesis en Curso', value: '-', color: 'text-purple-600', icon: BookOpen },
          { label: 'Estudiantes', value: '-', color: 'text-emerald-600', icon: GraduationCap },
          { label: 'Convenios Vigentes', value: '-', color: 'text-cyan-600', icon: Building2 },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Nota informativa */}
      <motion.div variants={itemVariants} className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900 dark:text-amber-100">Nota importante</h4>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              Los reportes muestran información filtrada según tu facultad/escuela asignada. 
              Si necesitas reportes de otras facultades, contacta al administrador del sistema.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
