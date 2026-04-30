'use client';

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
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// Mock data - replace with actual tRPC queries
const stats = [
  {
    title: 'Práctica Actual',
    value: 'En progreso',
    subtitle: '50% completado',
    icon: Briefcase,
    color: 'bg-blue-500',
    trend: '+12%',
  },
  {
    title: 'Tesis',
    value: 'Borrador',
    subtitle: '3 revisiones',
    icon: BookOpen,
    color: 'bg-amber-500',
    trend: 'Pendiente',
  },
  {
    title: 'Horas Acumuladas',
    value: '240h',
    subtitle: 'de 320h requeridas',
    icon: Clock,
    color: 'bg-emerald-500',
    trend: '75%',
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

const recentActivities = [
  { id: 1, title: 'Informe mensual enviado', date: 'Hace 2 días', type: 'success' },
  { id: 2, title: 'Revisión de tesis programada', date: 'Hace 3 días', type: 'info' },
  { id: 3, title: 'Documento rechazado', date: 'Hace 5 días', type: 'warning' },
];

const upcomingDeadlines = [
  { id: 1, title: 'Entrega de informe final', date: '15 Nov 2024', daysLeft: 12, priority: 'high' },
  { id: 2, title: 'Revisión con asesor', date: '20 Nov 2024', daysLeft: 17, priority: 'medium' },
  { id: 3, title: 'Actualización de datos', date: '30 Nov 2024', daysLeft: 27, priority: 'low' },
];

export default function StudentDashboard() {
  const isLoading = false; // Change to true to test loading state

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
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">
          ¡Bienvenido, Juan! 👋
        </h1>
        <p className="text-slate-500">
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
              className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <Icon className="w-5 h-5 text-slate-600" />
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    stat.trend.startsWith('+')
                      ? 'bg-emerald-100 text-emerald-700'
                      : stat.trend === 'Pendiente'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-500">{stat.title}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.subtitle}</p>
              </div>
              <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Actividad Reciente</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Últimas actualizaciones de tus procesos
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary-600">
                Ver todo
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-colors"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.type === 'success'
                      ? 'bg-emerald-100'
                      : activity.type === 'warning'
                      ? 'bg-amber-100'
                      : 'bg-blue-100'
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 ${
                      activity.type === 'success'
                        ? 'text-emerald-600'
                        : activity.type === 'warning'
                        ? 'text-amber-600'
                        : 'text-blue-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                  <p className="text-xs text-slate-500">{activity.date}</p>
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
          className="bg-white rounded-2xl border border-slate-100 shadow-sm"
        >
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-900">Próximos Vencimientos</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {upcomingDeadlines.map((deadline, index) => (
              <motion.div
                key={deadline.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">{deadline.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{deadline.date}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      deadline.priority === 'high'
                        ? 'bg-red-100 text-red-700'
                        : deadline.priority === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {deadline.daysLeft} días
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-4 border-t border-slate-100">
            <Link href="/student/calendario">
              <Button variant="outline" className="w-full">
                Ver calendario completo
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            title: 'Nueva solicitud de práctica',
            description: 'Inicia el proceso de prácticas preprofesionales',
            href: '/student/practicas/nueva',
            color: 'bg-blue-500',
          },
          {
            title: 'Subir documento de tesis',
            description: 'Actualiza el borrador de tu tesis',
            href: '/student/tesis/subir',
            color: 'bg-purple-500',
          },
          {
            title: 'Contactar asesor',
            description: 'Envía un mensaje a tu asesor académico',
            href: '/student/mensajes',
            color: 'bg-emerald-500',
          },
        ].map((action, index) => (
          <Link key={action.title} href={action.href}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-primary-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 transition-colors" />
              </div>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
