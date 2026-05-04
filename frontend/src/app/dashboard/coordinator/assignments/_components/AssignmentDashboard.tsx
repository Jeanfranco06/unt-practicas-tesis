'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  BookOpen,
  Users,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface DashboardStats {
  practicasPendientes: number;
  practicasConAsesor: number;
  tesisSinAsesor: number;
  tesisSinJurado: number;
  tesisCompletas: number;
  docentesDisponibles: number;
  docentesConCarga: number;
}

interface AssignmentDashboardProps {
  stats: DashboardStats;
  onViewPracticas: () => void;
  onViewTesis: () => void;
  onViewDocentes: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AssignmentDashboard({
  stats,
  onViewPracticas,
  onViewTesis,
  onViewDocentes,
}: AssignmentDashboardProps) {
  const needsAttention = stats.practicasPendientes + stats.tesisSinAsesor + stats.tesisSinJurado;

  return (
    <div className="space-y-6">
      {/* Alertas de atención */}
      {needsAttention > 0 && (
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-muted/50 border border-border rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {needsAttention} asignaciones requieren atención
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.practicasPendientes > 0 && `${stats.practicasPendientes} práctica${stats.practicasPendientes !== 1 ? 's' : ''} sin asesor. `}
                {stats.tesisSinAsesor > 0 && `${stats.tesisSinAsesor} tesis sin asesor. `}
                {stats.tesisSinJurado > 0 && `${stats.tesisSinJurado} tesis con jurado incompleto. `}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Prácticas Card */}
        <motion.button
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          onClick={onViewPracticas}
          className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Prácticas Pendientes</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.practicasPendientes}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.practicasConAsesor} con asesor asignado
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary">
            <TrendingUp className="w-4 h-4" />
            <span>Ver prácticas</span>
          </div>
        </motion.button>

        {/* Tesis Card */}
        <motion.button
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          onClick={onViewTesis}
          className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tesis sin Asesor</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.tesisSinAsesor}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.tesisCompletas} con asesor y jurado
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary">
            <Clock className="w-4 h-4" />
            <span>{stats.tesisSinJurado} necesitan jurado</span>
          </div>
        </motion.button>

        {/* Jurado Card */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-5"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tesis con Jurado Incompleto</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.tesisSinJurado}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Mínimo 3 jurados requeridos
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <Users className="w-6 h-6 text-foreground" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completar asignaciones</span>
          </div>
        </motion.div>

        {/* Docentes Card */}
        <motion.button
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          onClick={onViewDocentes}
          className="bg-card border border-border rounded-xl p-5 text-left hover:border-primary/50 hover:shadow-md transition-all group"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Docentes Activos</p>
              <p className="text-3xl font-bold text-foreground mt-1">{stats.docentesDisponibles}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.docentesConCarga} con asignaciones
              </p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-primary">
            <Users className="w-4 h-4" />
            <span>Ver disponibilidad</span>
          </div>
        </motion.button>
      </div>

      {/* Quick Actions */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.4 }}
        className="bg-muted/30 border border-border rounded-xl p-6"
      >
        <h3 className="font-semibold text-foreground mb-4">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onViewPracticas}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Briefcase className="w-4 h-4" />
            Asignar Asesores a Prácticas
          </button>
          <button
            onClick={onViewTesis}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Asignar Asesores a Tesis
          </button>
          <button
            onClick={onViewTesis}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <Users className="w-4 h-4" />
            Asignar Jurados
          </button>
          <button
            onClick={onViewDocentes}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Ver Carga Docente
          </button>
        </div>
      </motion.div>
    </div>
  );
}
