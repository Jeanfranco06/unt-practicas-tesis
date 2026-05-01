'use client';

import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
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

export default function CompanyApplicationsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [applications, setApplications] = useState<InternshipApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    const storedEmpresaId = localStorage.getItem('empresaId');
    if (storedEmpresaId) {
      setEmpresaId(storedEmpresaId);
    } else {
      setIsLoading(false);
    }
  }, []);

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
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">
                        {app.estudiante?.usuario?.nombre} {app.estudiante?.usuario?.apellidoPaterno}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(app.estado)}`}>
                        {getStatusLabel(app.estado)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {app.estudiante?.usuario?.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {app.oferta?.titulo}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Postuló: {new Date(app.fechaPostulacion).toLocaleDateString()}
                      </span>
                    </div>
                    {app.cartaPresentacion && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        &quot;{app.cartaPresentacion}&quot;
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {app.documentoCvUrl && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      CV
                    </Button>
                  )}
                  {app.estado === 'postulado' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => {
                          toast({
                            title: 'Función en desarrollo',
                            description: 'La aprobación de postulaciones será implementada próximamente',
                          });
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => {
                          toast({
                            title: 'Función en desarrollo',
                            description: 'El rechazo de postulaciones será implementado próximamente',
                          });
                        }}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
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
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron postulaciones</p>
            {(searchTerm || statusFilter !== 'todas') && (
              <p className="text-sm mt-2 opacity-70">Intenta ajustar los filtros de búsqueda</p>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
