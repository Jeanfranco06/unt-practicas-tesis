'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Search,
  Filter,
  X,
  Calendar,
  User,
  Mail,
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  Building2,
  Download,
  Eye,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from '../_lib/api';
import Link from 'next/link';

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
  { value: 'en_curso', label: 'En Curso', color: 'bg-blue-500/20 text-blue-600' },
  { value: 'completada', label: 'Completadas', color: 'bg-emerald-500/20 text-emerald-600' },
  { value: 'cancelada', label: 'Canceladas', color: 'bg-red-500/20 text-red-600' },
];

interface Internship {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  estudiante: {
    id: number;
    codigoEstudiante: string;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email: string;
    };
  };
  oferta: {
    id: number;
    titulo: string;
  };
  asesor?: {
    id: number;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
    };
  };
}

export default function CompanyInternshipsPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);

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

  const loadInternships = async () => {
    if (!empresaId) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(
        `${API_URL}/api/internships/company/internships?empresaId=${empresaId}`
      );
      setInternships(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar las prácticas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      loadInternships();
    }
  }, [empresaId]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'en_curso':
        return 'bg-blue-500/20 text-blue-600';
      case 'completada':
        return 'bg-emerald-500/20 text-emerald-600';
      case 'cancelada':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-slate-500/20 text-slate-600';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'en_curso':
        return 'En Curso';
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch =
      internship.estudiante?.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.estudiante?.usuario?.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.estudiante?.codigoEstudiante?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.oferta?.titulo?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todas' || internship.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: internships.length,
    enCurso: internships.filter((i) => i.estado === 'en_curso').length,
    completadas: internships.filter((i) => i.estado === 'completada').length,
    canceladas: internships.filter((i) => i.estado === 'cancelada').length,
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
        <h1 className="text-2xl font-bold text-foreground">Prácticas Activas</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona las prácticas profesionales de los estudiantes en tu empresa
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-primary' },
          { label: 'En Curso', value: stats.enCurso, color: 'bg-blue-500' },
          { label: 'Completadas', value: stats.completadas, color: 'bg-emerald-500' },
          { label: 'Canceladas', value: stats.canceladas, color: 'bg-red-500' },
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

      {/* Internships List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredInternships.map((internship) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        {internship.estudiante?.usuario?.nombre} {internship.estudiante?.usuario?.apellidoPaterno}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(internship.estado)}`}>
                        {getStatusLabel(internship.estado)}
                      </span>
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {internship.estudiante?.usuario?.email}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Código: {internship.estudiante?.codigoEstudiante}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {internship.oferta?.titulo}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Inicio: {new Date(internship.fechaInicio).toLocaleDateString()}
                      </span>
                      {internship.fechaFin && (
                        <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Fin: {new Date(internship.fechaFin).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {internship.asesor && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="font-medium">Asesor UNT:</span>{' '}
                        {internship.asesor.usuario.nombre} {internship.asesor.usuario.apellidoPaterno}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedInternship(internship)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalle
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredInternships.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron prácticas</p>
            {(searchTerm || statusFilter !== 'todas') && (
              <p className="text-sm mt-2 opacity-70">Intenta ajustar los filtros de búsqueda</p>
            )}
            <div className="mt-4">
              <Button asChild className="bg-primary hover:bg-primary/90 text-white">
                <Link href="/dashboard/company/applications">
                  Ver Postulaciones
                </Link>
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInternship && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInternship(null)}
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
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {selectedInternship.estudiante?.usuario?.nombre} {selectedInternship.estudiante?.usuario?.apellidoPaterno}
                  </h3>
                  <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(selectedInternship.estado)}`}>
                    {getStatusLabel(selectedInternship.estado)}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Código Estudiante</p>
                    <p className="font-medium text-foreground">{selectedInternship.estudiante?.codigoEstudiante}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground text-sm">{selectedInternship.estudiante?.usuario?.email}</p>
                  </div>
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Oferta</p>
                  <p className="font-medium text-foreground">{selectedInternship.oferta?.titulo}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Fecha Inicio</p>
                    <p className="font-medium text-foreground">
                      {new Date(selectedInternship.fechaInicio).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Fecha Fin</p>
                    <p className="font-medium text-foreground">
                      {selectedInternship.fechaFin
                        ? new Date(selectedInternship.fechaFin).toLocaleDateString()
                        : 'En curso'}
                    </p>
                  </div>
                </div>

                {selectedInternship.asesor && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Asesor UNT</p>
                    <p className="font-medium text-foreground">
                      {selectedInternship.asesor.usuario.nombre} {selectedInternship.asesor.usuario.apellidoPaterno}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={() => setSelectedInternship(null)} variant="outline">
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
