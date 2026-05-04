'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Users,
  FileText,
  CheckCircle,
  ChevronRight,
  GraduationCap,
  Building2,
  Plus,
  TrendingUp,
  ArrowRight,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from './_lib/api';

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

interface DashboardStats {
  totalOfertas: number;
  ofertasActivas: number;
  totalPostulaciones: number;
  postulacionesPendientes: number;
  practicasActivas: number;
  postulacionesAprobadas: number;
}

export default function CompanyDashboard() {
  const { role, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalOfertas: 0,
    ofertasActivas: 0,
    totalPostulaciones: 0,
    postulacionesPendientes: 0,
    practicasActivas: 0,
    postulacionesAprobadas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [isLoadingEmpresaId, setIsLoadingEmpresaId] = useState(true);

  // Redirigir si no es representante de empresa
  useEffect(() => {
    if (role && role !== 'RepresentanteEmpresa') {
      router.replace('/dashboard');
    }
  }, [role, router]);

  // Obtener empresaId - primero de localStorage, si no existe, del API
  useEffect(() => {
    const getEmpresaId = async () => {
      // Primero intentar de localStorage
      const storedEmpresaId = localStorage.getItem('empresaId');
      if (storedEmpresaId) {
        setEmpresaId(storedEmpresaId);
        setIsLoadingEmpresaId(false);
        return;
      }

      // Si no está en localStorage, obtener del API usando el user ID
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
      setIsLoadingEmpresaId(false);
    };

    if (isAuthenticated) {
      getEmpresaId();
    }
  }, [user, isAuthenticated]);

  // Cargar estadísticas
  useEffect(() => {
    const loadStats = async () => {
      if (!empresaId) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth(
          `${API_URL}/api/internships/company/dashboard-stats?empresaId=${empresaId}`
        );
        setStats(data);
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

    if (empresaId) {
      loadStats();
    }
  }, [empresaId, toast]);

  const statCards = [
    {
      title: 'Mis Ofertas',
      value: stats.totalOfertas,
      subtitle: `${stats.ofertasActivas} activas`,
      icon: Briefcase,
      color: 'bg-primary',
      href: '/dashboard/company/offers',
    },
    {
      title: 'Postulaciones',
      value: stats.totalPostulaciones,
      subtitle: `${stats.postulacionesPendientes} pendientes`,
      icon: Users,
      color: 'bg-emerald-500',
      href: '/dashboard/company/applications',
    },
    {
      title: 'Prácticas Activas',
      value: stats.practicasActivas,
      subtitle: 'estudiantes en práctica',
      icon: GraduationCap,
      color: 'bg-blue-500',
      href: '/dashboard/company/internships',
    },
    {
      title: 'Aprobados',
      value: stats.postulacionesAprobadas,
      subtitle: 'postulaciones aceptadas',
      icon: CheckCircle,
      color: 'bg-purple-500',
      href: '/dashboard/company/applications',
    },
  ];

  const quickActions = [
    {
      title: 'Publicar Oferta',
      description: 'Crear nueva oferta de prácticas',
      href: '/dashboard/company/offers/new',
      icon: Briefcase,
      color: 'bg-primary',
    },
    {
      title: 'Ver Postulaciones',
      description: `${stats.postulacionesPendientes} pendientes de revisión`,
      href: '/dashboard/company/applications',
      icon: Users,
      color: 'bg-emerald-500',
    },
    {
      title: 'Gestionar Convenios',
      description: 'Ver convenios con la universidad',
      href: '/dashboard/company/agreements',
      icon: FileText,
      color: 'bg-amber-500',
    },
  ];

  if (isLoadingEmpresaId || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Panel de Empresa</h1>
          <p className="text-muted-foreground">
            Gestión de ofertas, postulaciones y convenios
          </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
          <Link href="/dashboard/company/offers/new">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Oferta
          </Link>
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <a key={stat.title} href={stat.href}>
              <motion.div
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
                </div>
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                </div>
              </motion.div>
            </a>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
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
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div variants={itemVariants}>
        <div className="p-5 bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-xl border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">Gestión de Prácticas Profesionales</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Como representante de empresa, puedes publicar ofertas de prácticas, revisar postulaciones de estudiantes,
                y gestionar los convenios con la universidad. Las postulaciones aprobadas se convertirán automáticamente
                en prácticas profesionales.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
