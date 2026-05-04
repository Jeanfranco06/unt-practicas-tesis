'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  BookOpen,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  ChevronRight,
  Bell,
  BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/student/LoadingState';
import { trpc } from '@/lib/trpc/react';

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

export default function AdvisorDashboardPage() {
  // @ts-ignore - TRPC types
  const { data: internships, isLoading: loadingInternships } = (trpc as any).internships?.getMyAdvisedInternships?.useQuery() || { data: [], isLoading: false };
  // @ts-ignore - TRPC types
  const { data: thesis, isLoading: loadingThesis } = (trpc as any).thesis?.getMyAdvisedThesis?.useQuery() || { data: [], isLoading: false };
  // @ts-ignore - TRPC types
  const { data: notifications, isLoading: loadingNotifications } = (trpc as any).notifications?.getMyNotifications?.useQuery() || { data: [], isLoading: false };

  const isLoading = loadingInternships || loadingThesis || loadingNotifications;

  // Estadísticas
  const stats = {
    totalStudents: new Set([
      ...(internships?.map((i: any) => i.estudiante?.id) || []),
      ...(thesis?.map((t: any) => t.estudiante?.id) || [])
    ]).size,
    activeInternships: internships?.filter((i: any) => i.estado === 'activa').length || 0,
    thesisInProgress: thesis?.filter((t: any) => t.estado === 'en_desarrollo').length || 0,
    pendingReviews: (internships?.reduce((acc: number, i: any) => acc + (i.informes?.filter((inf: any) => inf.estado === 'pendiente').length || 0), 0) || 0) +
                    (thesis?.reduce((acc: number, t: any) => acc + (t.entregables?.reduce((eAcc: number, e: any) => eAcc + (e.entregas?.filter((ent: any) => ent.estado === 'entregado').length || 0), 0) || 0), 0) || 0),
    unreadNotifications: notifications?.filter((n: any) => !n.leido).length || 0,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard del Asesor</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Gestión de prácticas y tesis asignadas
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard del Asesor</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestión de prácticas y tesis asignadas
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Estudiantes', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
          { label: 'Prácticas Activas', value: stats.activeInternships, icon: Briefcase, color: 'bg-emerald-500' },
          { label: 'Tesis en Progreso', value: stats.thesisInProgress, icon: BookOpen, color: 'bg-purple-500' },
          { label: 'Pendientes Revisión', value: stats.pendingReviews, icon: AlertCircle, color: 'bg-amber-500' },
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

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/advisor/students">
          <div className="p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                <GraduationCap className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Mis Estudiantes</h3>
                <p className="text-sm text-muted-foreground">Ver todos los estudiantes asignados</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/advisor/internships">
          <div className="p-6 bg-card rounded-xl border border-border hover:border-emerald-500/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                <Briefcase className="w-6 h-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Prácticas</h3>
                <p className="text-sm text-muted-foreground">Supervisar prácticas preprofesionales</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/advisor/thesis">
          <div className="p-6 bg-card rounded-xl border border-border hover:border-purple-500/50 transition-all cursor-pointer group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <BookOpen className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Tesis</h3>
                <p className="text-sm text-muted-foreground">Revisar proyectos de tesis</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prácticas Recientes */}
        <div className="p-6 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              Prácticas Recientes
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/advisor/internships">Ver todas</Link>
            </Button>
          </div>
          {internships?.slice(0, 3).length > 0 ? (
            <div className="space-y-3">
              {internships.slice(0, 3).map((internship: any) => (
                <div key={internship.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-emerald-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {internship.estudiante?.usuario?.nombre} {internship.estudiante?.usuario?.apellidoPaterno}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {internship.empresa?.razonSocial || 'Empresa no especificada'}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    internship.estado === 'activa' ? 'bg-emerald-500/20 text-emerald-600' :
                    internship.estado === 'en_evaluacion' ? 'bg-amber-500/20 text-amber-600' :
                    'bg-gray-500/20 text-gray-600'
                  }`}>
                    {internship.estado === 'activa' ? 'Activa' :
                     internship.estado === 'en_evaluacion' ? 'En Evaluación' :
                     'Finalizada'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes prácticas asignadas actualmente
            </p>
          )}
        </div>

        {/* Tesis Recientes */}
        <div className="p-6 bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Tesis Asignadas
            </h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/advisor/thesis">Ver todas</Link>
            </Button>
          </div>
          {thesis?.slice(0, 3).length > 0 ? (
            <div className="space-y-3">
              {thesis.slice(0, 3).map((t: any) => (
                <div key={t.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-400 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {t.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t.estudiante?.usuario?.nombre} {t.estudiante?.usuario?.apellidoPaterno}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    t.estado === 'en_desarrollo' ? 'bg-amber-500/20 text-amber-600' :
                    t.estado === 'en_revision' ? 'bg-blue-500/20 text-blue-600' :
                    t.estado === 'culminado' ? 'bg-emerald-500/20 text-emerald-600' :
                    'bg-gray-500/20 text-gray-600'
                  }`}>
                    {t.estado === 'en_desarrollo' ? 'En Desarrollo' :
                     t.estado === 'en_revision' ? 'En Revisión' :
                     t.estado === 'culminado' ? 'Culminado' :
                     t.estado}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No tienes tesis asignadas actualmente
            </p>
          )}
        </div>
      </motion.div>

      {/* Pending Reviews Summary */}
      {(stats.pendingReviews > 0 || stats.unreadNotifications > 0) && (
        <motion.div variants={itemVariants} className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground">Tienes actividades pendientes</h3>
              <p className="text-sm text-muted-foreground">
                {stats.pendingReviews > 0 && `${stats.pendingReviews} elemento${stats.pendingReviews > 1 ? 's' : ''} pendiente${stats.pendingReviews > 1 ? 's' : ''} de revisión`}
                {stats.pendingReviews > 0 && stats.unreadNotifications > 0 && ' y '}
                {stats.unreadNotifications > 0 && `${stats.unreadNotifications} notificación${stats.unreadNotifications > 1 ? 'es' : ''} sin leer`}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/advisor/students">Revisar</Link>
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
