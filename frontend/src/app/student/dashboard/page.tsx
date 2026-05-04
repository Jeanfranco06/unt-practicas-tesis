'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  BookOpen,
  Clock,
  TrendingUp,
  Calendar,
  ChevronRight,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { CardSkeleton, LoadingState } from '@/components/student/LoadingState';
import { StatusBadge } from '@/components/student/StatusBadge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/react';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from '@/app/dashboard/internships/_lib/offers';

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

interface StatCard {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Briefcase;
  color: string;
  trend: string;
}

interface Activity {
  id: number;
  title: string;
  date: string;
  type: 'success' | 'info' | 'warning';
}

interface Deadline {
  id: number;
  title: string;
  date: string;
  daysLeft: number;
  priority: 'high' | 'medium' | 'low';
}


export default function StudentDashboard() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  // @ts-ignore - TRPC types need regeneration after backend changes
  const { data: myInternship, isLoading: loadingInternship } = (trpc as any).internships?.getMyInternship?.useQuery() || { data: null, isLoading: false };
  // @ts-ignore - TRPC types need regeneration after backend changes
  const { data: thesisProjects, isLoading: loadingThesis } = (trpc as any).thesis?.listProjects?.useQuery() || { data: null, isLoading: false };

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await fetchWithAuth(`${API_URL}/api/notifications?limit=5`);
      setNotifications(data || []);
    } catch (err) {
      console.error('Error cargando notificaciones:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const userName = user?.email?.split('@')[0] || 'Estudiante';

  // Convertir notificaciones a actividades
  const recentActivities: Activity[] = notifications.slice(0, 3).map((n: any, i: number) => ({
    id: n.id || i,
    title: n.titulo || 'Notificación',
    date: n.creadoEn ? new Date(n.creadoEn).toLocaleDateString('es-ES') : 'Reciente',
    type: n.tipo === 'exito' ? 'success' : n.tipo === 'error' ? 'warning' : 'info',
  }));

  // Vencimientos basados en práctica actual
  const upcomingDeadlines: Deadline[] = myInternship?.fechaFinPractica ? [
    {
      id: 1,
      title: 'Fin de práctica',
      date: new Date(myInternship.fechaFinPractica).toLocaleDateString('es-ES'),
      daysLeft: Math.max(0, Math.ceil((new Date(myInternship.fechaFinPractica).getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
      priority: 'high',
    },
  ] : [];

  // Calculate stats based on real data
  const horasAcumuladas = myInternship?.seguimiento?.reduce((acc: number, s: any) => acc + (s.horas || 0), 0) || 0;
  const horasRequeridas = 320;
  const porcentajeHoras = Math.min(Math.round((horasAcumuladas / horasRequeridas) * 100), 100);

  const stats: StatCard[] = [
    {
      title: 'Práctica Actual',
      value: myInternship?.estado ? myInternship.estado.replace('_', ' ') : 'Sin práctica',
      subtitle: myInternship?.oferta?.titulo ? myInternship.oferta.titulo.substring(0, 30) + '...' : 'No has iniciado una práctica',
      icon: Briefcase,
      color: myInternship?.estado === 'en_progreso' ? 'bg-blue-500' : myInternship?.estado === 'completada' ? 'bg-emerald-500' : 'bg-slate-500',
      trend: myInternship?.estado === 'en_progreso' ? 'Activa' : myInternship?.estado || 'Pendiente',
    },
    {
      title: 'Tesis',
      value: thesisProjects?.length > 0 ? 'En progreso' : 'Sin proyecto',
      subtitle: thesisProjects?.length > 0 ? `${thesisProjects.length} proyecto(s) activo(s)` : 'No tienes un proyecto de tesis',
      icon: BookOpen,
      color: thesisProjects?.length > 0 ? 'bg-amber-500' : 'bg-slate-500',
      trend: thesisProjects?.length > 0 ? 'Activo' : 'Pendiente',
    },
    {
      title: 'Horas Acumuladas',
      value: `${horasAcumuladas}h`,
      subtitle: `de ${horasRequeridas}h requeridas`,
      icon: Clock,
      color: porcentajeHoras >= 75 ? 'bg-emerald-500' : porcentajeHoras >= 50 ? 'bg-blue-500' : porcentajeHoras >= 25 ? 'bg-amber-500' : 'bg-red-500',
      trend: `${porcentajeHoras}%`,
    },
    {
      title: 'Documentos',
      value: '8/12',
      subtitle: 'documentos entregados',
      icon: FileText,
      color: 'bg-purple-500',
      trend: '66%',
    },
  ];

  const isLoading = loadingInternship || loadingThesis;

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
          ¡Bienvenido, {userName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Aquí está el resumen de tu progreso académico
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map((stat, index) => {
          const Icon = stat.icon;
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
                <div className="p-3 bg-muted rounded-xl">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend.startsWith('+')
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                      : stat.trend === 'Pendiente'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{stat.subtitle}</p>
              </div>
              <div className="mt-4 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: stat.trend.replace('%', '') + '%' }}
                  transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                  className={`h-full ${stat.color} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-soft"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground">Actividad Reciente</h2>
                  <p className="text-xs text-muted-foreground">Últimas actualizaciones de tus procesos</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                Ver todo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'success'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20'
                      : activity.type === 'warning'
                      ? 'bg-amber-100 dark:bg-amber-500/20'
                      : 'bg-blue-100 dark:bg-blue-500/20'
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 ${
                      activity.type === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : activity.type === 'warning'
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-blue-600 dark:text-blue-400'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.date}</p>
                </div>
                <StatusBadge
                  variant={
                    activity.type === 'success'
                      ? 'completed'
                      : activity.type === 'warning'
                      ? 'pending'
                      : 'default'
                  }
                  size="sm"
                >
                  {activity.type === 'success'
                    ? 'Completado'
                    : activity.type === 'warning'
                    ? 'Atención'
                    : 'Info'}
                </StatusBadge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Deadlines */}
        <motion.div
          variants={itemVariants}
          className="bg-card rounded-2xl border border-border shadow-soft"
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground">Próximos Vencimientos</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-muted/50 rounded-xl border border-border/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{deadline.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{deadline.date}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      deadline.priority === 'high'
                        ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                        : deadline.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {deadline.daysLeft} días
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-border">
            <Link href="/student/calendario">
              <Button variant="outline" className="w-full border-border hover:bg-muted">
                Ver calendario completo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[          {
            title: 'Nueva solicitud de práctica',
            description: 'Inicia el proceso de prácticas preprofesionales',
            href: '/student/practicas/nueva',
            color: 'bg-blue-500',
            icon: Briefcase,
          },
          {
            title: 'Subir documento de tesis',
            description: 'Actualiza el borrador de tu tesis',
            href: '/student/tesis/subir',
            color: 'bg-purple-500',
            icon: BookOpen,
          },
          {
            title: 'Contactar asesor',
            description: 'Envía un mensaje a tu asesor académico',
            href: '/student/mensajes',
            color: 'bg-emerald-500',
            icon: TrendingUp,
          },
        ].map((action, index) => (
          <Link key={action.title} href={action.href}>
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
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}

