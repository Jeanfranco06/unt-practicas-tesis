'use client';

import { motion } from 'framer-motion';
import {
  Briefcase,
  BookOpen,
  FileText,
  Users,
  TrendingUp,
  ChevronRight,
  Clock,
  Bell,
  AlertCircle,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/react';
import { CardSkeleton, LoadingState } from '@/components/student/LoadingState';
import { getPendingAdvisors } from './users/_lib/users';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

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

const statCards = [
  {
    title: 'Prácticas Activas',
    icon: Briefcase,
    color: 'bg-primary',
    bgColor: 'bg-primary',
  },
  {
    title: 'Tesis en Curso',
    icon: BookOpen,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-500',
  },
  {
    title: 'Convenios Vigentes',
    icon: FileText,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500',
  },
  {
    title: 'Estudiantes Registrados',
    icon: Users,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500',
  },
];

export default function DashboardPage() {
  const { role } = useAuth();
  const [pendingAdvisors, setPendingAdvisors] = useState<any[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (role === 'Administrador') {
      loadPendingAdvisors();
    }
  }, [role]);

  const loadPendingAdvisors = async () => {
    try {
      setIsLoadingPending(true);
      const advisors = await getPendingAdvisors();
      setPendingAdvisors(advisors);
    } catch (error) {
      console.error('Error loading pending advisors:', error);
      setPendingAdvisors([]);
    } finally {
      setIsLoadingPending(false);
    }
  };

  // @ts-ignore - TRPC types need regeneration after backend changes
  const { data: stats, isLoading } = (trpc as any).dashboard?.getStats?.useQuery() || { data: null, isLoading: false };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <LoadingState rows={3} />
      </div>
    );
  }

  const statValues = [
    stats?.activeInternships || 0,
    stats?.activeThesis || 0,
    stats?.activeAgreements || 0,
    stats?.totalStudents || 0,
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome */}
      <motion.div variants={itemVariants} className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground">
          Resumen del sistema de prácticas y tesis
        </p>
      </motion.div>

      {/* Notifications Banner - Solo para admin */}
      {role === 'Administrador' && pendingAdvisors.length > 0 && !bannerDismissed && (
        <motion.div
          variants={itemVariants}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                Tienes {pendingAdvisors.length} solicitud{pendingAdvisors.length > 1 ? 'es' : ''} pendiente{pendingAdvisors.length > 1 ? 's' : ''}
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Asesores esperando aprobación
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => window.location.href = '/dashboard/users'}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              Revisar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setBannerDismissed(true)}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const value = statValues[index];
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-6 bg-card rounded-2xl border border-border shadow-soft hover:shadow-elevated hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 ${stat.color} rounded-xl`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                  +{Math.floor(Math.random() * 20) + 1}%
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
              </div>
              <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((value / 100) * 100, 100)}%` }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-full ${stat.bgColor} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Internships by Month */}
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-2xl border border-border shadow-soft"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Prácticas por Mes</h2>
                  <p className="text-xs text-muted-foreground">Inicios de prácticas mensuales</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Ver todo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="p-6">
            {stats?.internshipByMonth && stats.internshipByMonth.length > 0 ? (
              <div className="space-y-3">
                {stats.internshipByMonth.slice(0, 6).map((item: any, index: number) => (
                  <div key={item.month} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground w-16">{item.month}</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-primary rounded-lg flex items-center justify-end px-2"
                      >
                        <span className="text-xs font-medium text-white">{item.count}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">No hay datos de prácticas disponibles</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Thesis by Area */}
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-2xl border border-border shadow-soft"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Tesis por Área</h2>
                  <p className="text-xs text-muted-foreground">Distribución por área de conocimiento</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Ver todo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="p-6">
            {stats?.thesisByArea && stats.thesisByArea.length > 0 ? (
              <div className="space-y-3">
                {stats.thesisByArea.map((item: any, index: number) => (
                  <div key={item.area} className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground flex-1 truncate">{item.area}</span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.count / 5) * 100, 100)}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-purple-500 rounded-lg flex items-center justify-end px-2"
                      >
                        <span className="text-xs font-medium text-white">{item.count}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-sm">No hay datos de tesis disponibles</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Gestionar Prácticas',
            description: 'Ver y administrar prácticas activas',
            href: '/dashboard/internships',
            color: 'bg-primary',
            icon: Briefcase,
          },
          {
            title: 'Revisar Tesis',
            description: 'Acceder a proyectos de tesis',
            href: '/dashboard/thesis',
            color: 'bg-purple-500',
            icon: BookOpen,
          },
          {
            title: 'Ver Reportes',
            description: 'Generar reportes del sistema',
            href: '/dashboard/reports',
            color: 'bg-emerald-500',
            icon: TrendingUp,
          },
        ].map((action) => (
          <a key={action.title} href={action.href}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 bg-card rounded-xl border border-border shadow-soft hover:shadow-elevated hover:border-primary/20 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center shadow-sm`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
            </motion.div>
          </a>
        ))}
      </motion.div>
    </motion.div>
  );
}
