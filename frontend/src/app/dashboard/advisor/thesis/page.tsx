'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Search,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  FileText,
  XCircle,
  Users,
  ClipboardCheck,
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
  en_registro: { label: 'En Registro', color: 'bg-gray-500/20 text-gray-600', icon: Clock },
  propuesto: { label: 'Propuesto', color: 'bg-blue-500/20 text-blue-600', icon: FileText },
  aprobado: { label: 'Aprobado', color: 'bg-emerald-500/20 text-emerald-600', icon: CheckCircle },
  en_desarrollo: { label: 'En Desarrollo', color: 'bg-amber-500/20 text-amber-600', icon: Clock },
  en_revision: { label: 'En Revisión', color: 'bg-purple-500/20 text-purple-600', icon: ClipboardCheck },
  culminado: { label: 'Culminado', color: 'bg-green-500/20 text-green-600', icon: CheckCircle },
  desaprobado: { label: 'Desaprobado', color: 'bg-red-500/20 text-red-600', icon: XCircle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500/20 text-gray-600', icon: XCircle },
};

export default function AdvisorThesisPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // @ts-ignore - TRPC types
  const { data: thesis, isLoading, refetch } = (trpc as any).thesis?.getMyAdvisorProjects?.useQuery() || { data: [], isLoading: false, refetch: () => {} };

  // Filtrar tesis
  const filteredThesis = thesis?.filter((t: any) => {
    const matchesSearch =
      t.estudiante?.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.estudiante?.usuario?.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.areaConocimiento?.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && t.estado === statusFilter;
  }) || [];

  // Estadísticas
  const stats = {
    total: thesis?.length || 0,
    enDesarrollo: thesis?.filter((t: any) => t.estado === 'en_desarrollo').length || 0,
    enRevision: thesis?.filter((t: any) => t.estado === 'en_revision').length || 0,
    culminados: thesis?.filter((t: any) => t.estado === 'culminado').length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Tesis</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Proyectos de tesis asignados como asesor
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
          <h1 className="text-2xl font-bold text-foreground">Mis Tesis</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Proyectos de tesis asignados como asesor
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: BookOpen, color: 'bg-purple-500' },
          { label: 'En Desarrollo', value: stats.enDesarrollo, icon: Clock, color: 'bg-amber-500' },
          { label: 'En Revisión', value: stats.enRevision, icon: ClipboardCheck, color: 'bg-blue-500' },
          { label: 'Culminados', value: stats.culminados, icon: CheckCircle, color: 'bg-emerald-500' },
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
            placeholder="Buscar por estudiante, título o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'en_desarrollo', label: 'En Desarrollo' },
            { id: 'en_revision', label: 'En Revisión' },
            { id: 'aprobado', label: 'Aprobados' },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setStatusFilter(filter.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === filter.id
                  ? 'bg-purple-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Thesis List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredThesis.length > 0 ? (
          filteredThesis.map((t: any) => {
            const estado = estadoConfig[t.estado] || estadoConfig.en_desarrollo;
            const EstadoIcon = estado.icon;

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-card rounded-xl border border-border hover:border-purple-500/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student & Title */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground line-clamp-2">
                          {t.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t.estudiante?.usuario?.nombre} {t.estudiante?.usuario?.apellidoPaterno} • {t.estudiante?.codigoUniversitario}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${estado.color}`}>
                            <EstadoIcon className="w-3 h-3" />
                            {estado.label}
                          </span>
                          <span className="px-2 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                            {t.areaConocimiento}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="flex flex-wrap gap-6 lg:border-l lg:pl-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Entregables</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.entregables?.length || 0} definido(s)
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Entregas</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t.entregables?.reduce((acc: number, e: any) => acc + (e.entregas?.length || 0), 0)} realizada(s)
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Inicio</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(t.fechaRegistro).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 lg:border-l lg:pl-6">
                    <Button className="bg-purple-500 hover:bg-purple-600" asChild>
                      <Link href={`/dashboard/advisor/thesis/${t.id}`}>
                        Ver detalle
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                    {t.estado === 'en_desarrollo' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/advisor/thesis/${t.id}/submissions`}>
                          <FileText className="w-4 h-4 mr-1" />
                          Revisar entregas
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
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No hay tesis asignadas</p>
            <p className="text-sm mt-2">Aún no tienes proyectos de tesis asignados como asesor.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
