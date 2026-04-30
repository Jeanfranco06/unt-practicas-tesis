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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc/react';
import { CardSkeleton, LoadingState } from '@/components/student/LoadingState';

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

const statCards = [
  {
    title: 'Prácticas Activas',
    icon: Briefcase,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-500',
    trend: '+12%',
  },
  {
    title: 'Tesis en Curso',
    icon: BookOpen,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-500',
    trend: '+5%',
  },
  {
    title: 'Convenios Vigentes',
    icon: FileText,
    color: 'bg-emerald-500',
    bgColor: 'bg-emerald-500',
    trend: '+3%',
  },
  {
    title: 'Estudiantes Registrados',
    icon: Users,
    color: 'bg-amber-500',
    bgColor: 'bg-amber-500',
    trend: '+18%',
  },
];

export default function DashboardPage() {
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
      <motion.div variants={itemVariants} className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">
          Panel de Administración
        </h1>
        <p className="text-slate-400">
          Resumen del sistema de prácticas y tesis
        </p>
      </motion.div>

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
              className="p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-lg hover:shadow-xl hover:border-slate-700 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className={`p-3 ${stat.color} rounded-xl`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  {stat.trend}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-slate-400">{stat.title}</h3>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
              </div>
              <div className="mt-4 h-1.5 bg-slate-800 rounded-full overflow-hidden">
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
          className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg"
        >
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Briefcase className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Prácticas por Mes</h2>
                  <p className="text-sm text-slate-500">Inicios de prácticas mensuales</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
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
                    <span className="text-sm text-slate-400 w-16">{item.month}</span>
                    <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((item.count / 10) * 100, 100)}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-blue-500 rounded-lg flex items-center justify-end px-2"
                      >
                        <span className="text-xs font-medium text-white">{item.count}</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No hay datos de prácticas disponibles</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Thesis by Area */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 rounded-2xl border border-slate-800 shadow-lg"
        >
          <div className="p-6 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-100">Tesis por Área</h2>
                  <p className="text-sm text-slate-500">Distribución por área de conocimiento</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
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
                    <span className="text-sm text-slate-400 flex-1 truncate">{item.area}</span>
                    <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
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
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No hay datos de tesis disponibles</p>
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
            color: 'bg-blue-500',
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
        ].map((action, index) => (
          <a key={action.title} href={action.href}>
            <motion.div
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="p-5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg hover:shadow-xl hover:border-slate-700 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
              </div>
            </motion.div>
          </a>
        ))}
      </motion.div>
    </motion.div>
  );
}