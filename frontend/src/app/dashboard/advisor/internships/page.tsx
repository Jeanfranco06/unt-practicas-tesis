'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Search,
  GraduationCap,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  XCircle,
  Hourglass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/student/LoadingState';
import { trpc } from '@/lib/trpc/react';
import { useToast } from '@/components/ui/use-toast';

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

export default function AdvisorInternshipsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // @ts-ignore - TRPC types
  const { data: internships, isLoading, refetch } = (trpc as any).internships?.getMyAdvisedInternships?.useQuery() || { data: [], isLoading: false, refetch: () => {} };

  // Filtrar prácticas
  const filteredInternships = internships?.filter((internship: any) => {
    const matchesSearch =
      internship.estudiante?.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.estudiante?.usuario?.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.empresa?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.nombreEmpresaExterna?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && internship.estado === statusFilter;
  }) || [];

  // Estadísticas
  const stats = {
    total: internships?.length || 0,
    activas: internships?.filter((i: any) => i.estado === 'activa').length || 0,
    enEvaluacion: internships?.filter((i: any) => i.estado === 'en_evaluacion').length || 0,
    pendientes: internships?.filter((i: any) => i.estado === 'pendiente_asignacion').length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Prácticas</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Prácticas asignadas a tus estudiantes
            </p>
          </div>
        </div>
        <LoadingState rows={5} />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Prácticas</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Prácticas asignadas a tus estudiantes
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: Briefcase, color: 'bg-primary' },
          { label: 'Activas', value: stats.activas, icon: CheckCircle, color: 'bg-emerald-500' },
          { label: 'En Evaluación', value: stats.enEvaluacion, icon: Hourglass, color: 'bg-amber-500' },
          { label: 'Pendientes', value: stats.pendientes, icon: AlertCircle, color: 'bg-blue-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-card rounded-xl border border-border">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por estudiante o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'activa', label: 'Activas' },
            { id: 'en_evaluacion', label: 'En Evaluación' },
            { id: 'pendiente_asignacion', label: 'Pendientes' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Internships List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredInternships.length > 0 ? (
          filteredInternships.map((internship: any) => {
            const estado = estadoConfig[internship.estado] || estadoConfig.activa;
            const EstadoIcon = estado.icon;

            return (
              <motion.div
                key={internship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {internship.estudiante?.usuario?.nombre} {internship.estudiante?.usuario?.apellidoPaterno}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {internship.estudiante?.codigoUniversitario} • {internship.estudiante?.escuelaProfesional}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estado.color}`}>
                            <EstadoIcon className="w-3 h-3" />
                            {estado.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Company & Progress */}
                  <div className="flex flex-wrap gap-6 lg:border-l lg:pl-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Empresa</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {internship.empresa?.razonSocial || internship.nombreEmpresaExterna || 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Progreso</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${Math.min((internship.horasCompletadas / internship.horasTotalesRequeridas) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {internship.horasCompletadas}/{internship.horasTotalesRequeridas}h
                          </span>
                        </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Informes</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {internship.informes?.length || 0} entregado(s)
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:border-l lg:pl-6">
                    <Button asChild>
                      <Link href={`/dashboard/advisor/internships/${internship.id}`}>
                        Ver detalle
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    {internship.estado === 'activa' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/advisor/internships/${internship.id}/hours`}>
                          <Clock className="w-4 h-4 mr-1" />
                          Revisar horas
                        </Link>
                      </Button>
                    )}
                    {internship.estado === 'en_evaluacion' && (
                      <Button variant="outline" size="sm" className="text-amber-600" asChild>
                        <Link href={`/dashboard/advisor/internships/${internship.id}/evaluate`}>
                          <FileText className="w-4 h-4 mr-1" />
                          Evaluar
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No hay prácticas asignadas</p>
            <p className="text-sm mt-2">Aún no tienes prácticas asignadas a tu supervisión.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
