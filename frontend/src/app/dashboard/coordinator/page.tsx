'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle,
  UserCheck,
  ClipboardList,
  AlertCircle,
  Briefcase,
  BookOpen,
  Users,
  Building2,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  getPendingApplications,
  getPendingInternships,
  getAgreements,
  getThesisProjects,
} from './_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface DashboardStats {
  pendingApplications: number;
  pendingAssignments: number;
  expiringAgreements: number;
  activeInternships: number;
  activeThesis: number;
}

export default function CoordinatorDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    pendingApplications: 0,
    pendingAssignments: 0,
    expiringAgreements: 0,
    activeInternships: 0,
    activeThesis: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const dataLoaded = useRef(false);

  useEffect(() => {
    if (dataLoaded.current) return;
    dataLoaded.current = true;

    const loadStats = async () => {
      try {
        setIsLoading(true);
        const [applications, internships, agreements, thesis] = await Promise.all([
          getPendingApplications(),
          getPendingInternships(),
          getAgreements(),
          getThesisProjects(),
        ]);

        const expiringAgreements = agreements.filter((a: any) => {
          if (a.estado !== 'vigente') return false;
          const vencimiento = new Date(a.fechaVencimiento);
          const hoy = new Date();
          const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
          return diffDays <= 30 && diffDays > 0;
        });

        setStats({
          pendingApplications: applications.length,
          pendingAssignments: internships.length,
          expiringAgreements: expiringAgreements.length,
          activeInternships: internships.filter((i: any) => i.estado === 'activa').length,
          activeThesis: thesis.filter((t: any) => t.estado === 'en_desarrollo' || t.estado === 'aprobado').length,
        });
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message || 'No se pudieron cargar las estadísticas',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const quickActions = [
    {
      title: 'Aprobar Postulaciones',
      description: `${stats.pendingApplications} postulación${stats.pendingApplications !== 1 ? 'es' : ''} pendiente${stats.pendingApplications !== 1 ? 's' : ''}`,
      href: '/dashboard/coordinator/applications',
      icon: CheckCircle,
      color: 'bg-emerald-500',
      urgent: stats.pendingApplications > 0,
    },
    {
      title: 'Asignar Asesores',
      description: `${stats.pendingAssignments} práctica${stats.pendingAssignments !== 1 ? 's' : ''} pendiente${stats.pendingAssignments !== 1 ? 's' : ''}`,
      href: '/dashboard/coordinator/assignments',
      icon: UserCheck,
      color: 'bg-blue-500',
      urgent: stats.pendingAssignments > 0,
    },
    {
      title: 'Gestionar Convenios',
      description: `${stats.expiringAgreements} convenio${stats.expiringAgreements !== 1 ? 's' : ''} por vencer`,
      href: '/dashboard/coordinator/agreements',
      icon: ClipboardList,
      color: 'bg-amber-500',
      urgent: stats.expiringAgreements > 0,
    },
  ];

  const secondaryActions = [
    { title: 'Prácticas', description: 'Gestión general', href: '/dashboard/internships', icon: Briefcase, color: 'bg-primary' },
    { title: 'Tesis', description: 'Proyectos de tesis', href: '/dashboard/thesis', icon: BookOpen, color: 'bg-purple-500' },
    { title: 'Estudiantes', description: 'Listado de estudiantes', href: '/dashboard/students', icon: Users, color: 'bg-cyan-500' },
    { title: 'Empresas', description: 'Empresas registradas', href: '/dashboard/companies', icon: Building2, color: 'bg-pink-500' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Panel del Coordinador
        </h1>
        <p className="text-muted-foreground">
          Gestión integral de prácticas, tesis y convenios de tu facultad
        </p>
      </motion.div>

      {/* Priority Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Acciones Prioritarias
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-5 bg-card rounded-xl border ${action.urgent ? 'border-amber-500/50 shadow-lg shadow-amber-500/10' : 'border-border'} shadow-soft hover:shadow-elevated transition-all cursor-pointer group`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-sm`}>
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {action.title}
                      </h3>
                      <p className={`text-sm ${action.urgent ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Postulaciones Pendientes', value: stats.pendingApplications, color: 'text-emerald-600', icon: CheckCircle },
          { label: 'Asignaciones Pendientes', value: stats.pendingAssignments, color: 'text-blue-600', icon: UserCheck },
          { label: 'Prácticas Activas', value: stats.activeInternships, color: 'text-purple-600', icon: Briefcase },
          { label: 'Tesis en Curso', value: stats.activeThesis, color: 'text-cyan-600', icon: BookOpen },
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

      {/* Secondary Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Gestión General</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {secondaryActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 bg-card rounded-xl border border-border shadow-soft hover:shadow-elevated hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Reports Link */}
      <motion.div variants={itemVariants}>
        <Link href="/dashboard/reports">
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="p-4 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl border border-primary/20 flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Ver Reportes</h3>
                <p className="text-sm text-muted-foreground">Accede a reportes del estado general de los procesos</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </Link>
      </motion.div>
    </motion.div>
  );
}
