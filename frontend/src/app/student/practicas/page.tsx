'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/student/StatusBadge';
import { EmptyState } from '@/components/student/EmptyState';
import { CardSkeleton } from '@/components/student/LoadingState';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/react';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, fetchWithAuth } from '@/app/dashboard/internships/_lib/offers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const filtros = ['Todas', 'Activas', 'Completadas', 'Pendientes'];

export default function PracticasPage() {
  const { toast } = useToast();
  const [filtroActivo, setFiltroActivo] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [practicaActual, setPracticaActual] = useState<any>(null);
  const [practicas, setPracticas] = useState<any[]>([]);

  useEffect(() => {
    loadPractica();
  }, []);

  const loadPractica = async () => {
    try {
      setIsLoading(true);
      // Cargar práctica actual
      const currentData = await fetchWithAuth(`${API_URL}/api/internships/my-internship`);
      if (currentData && !currentData.message) {
        setPracticaActual(currentData);
        
        // Check if internship has started or is in the future
        const startDate = currentData.fechaInicio || currentData.oferta?.fechaInicioPractica;
        const hasStarted = startDate ? new Date(startDate) <= new Date() : true;
        const daysUntilStart = startDate ? 
          Math.ceil((new Date(startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
        
        // Add practice data with calculated state
        const practiceWithState = {
          ...currentData,
          _calculatedState: !hasStarted ? 'starting_soon' : currentData.estado,
          _daysUntilStart: daysUntilStart,
          _hasStarted: hasStarted,
        };
        
        // Agregar a la lista de prácticas
        setPracticas([practiceWithState]);
      }
      
      // Cargar postulaciones para mostrar prácticas completadas y en proceso
      const applicationsData = await fetchWithAuth(`${API_URL}/api/internships/my-applications`);
      if (applicationsData && Array.isArray(applicationsData)) {
        // Convertir postulaciones a formato de prácticas
        const practicesFromApplications = applicationsData.map((app: any) => ({
          id: `app-${app.id}`, // Prefix to avoid ID collision with real internships
          empresa: app.oferta?.empresa?.razonSocial || 'Empresa no especificada',
          cargo: app.oferta?.titulo || 'Cargo no especificado',
          fechaInicio: app.fechaInicio || '',
          fechaFin: app.fechaFin || '',
          // Map application status correctly - approved application is NOT a completed practice
          estado: app.estado === 'aprobado' ? 'approved' : app.estado === 'rechazado' ? 'rejected' : 'pending',
          horas: app.horasAcumuladas || 0,
          horasTotales: 320,
          supervisor: app.supervisor || 'Sin asignar',
          progreso: app.progreso || 0,
          documentos: app.documentosEntregados || 0,
          documentosTotales: 8,
          postulacion: app,
          tipo: 'postulacion' // Mark as application, not practice
        }));
        
        setPracticas(prev => {
          const allPractices = [...prev];
          // Get the real internship's postulacionId to avoid duplicates
          const realInternshipPostulacionId = currentData?.postulacionId;
          
          practicesFromApplications.forEach((newPractice: any) => {
            // Skip if this application already has a real internship
            if (realInternshipPostulacionId && newPractice.postulacion?.id === realInternshipPostulacionId) {
              return;
            }
            // Skip if already in list
            if (!allPractices.find(p => p.id === newPractice.id)) {
              allPractices.push(newPractice);
            }
          });
          return allPractices;
        });
      }
    } catch (err: any) {
      console.error('Error cargando prácticas:', err);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar tus prácticas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const practicasFiltradas = practicas.filter((p) => {
    const empresaStr = typeof p.empresa === 'string' ? p.empresa : 
                      p.empresa?.razonSocial || 
                      p.empresa?.nombreComercial || 
                      'Empresa no especificada';
    const cargoStr = typeof p.cargo === 'string' ? p.cargo : 'Cargo no especificado';
    
    const matchesBusqueda = empresaStr.toLowerCase().includes(busqueda.toLowerCase()) ||
      cargoStr.toLowerCase().includes(busqueda.toLowerCase());
    const matchesFiltro = filtroActivo === 'Todas' ||
      (filtroActivo === 'Activas' && (p.estado === 'active' || p.estado === 'approved')) ||
      (filtroActivo === 'Completadas' && p.estado === 'completed') ||
      (filtroActivo === 'Pendientes' && (p.estado === 'pending' || p.estado === 'postulado'));
    return matchesBusqueda && matchesFiltro;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
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
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Prácticas</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus prácticas preprofesionales
          </p>
        </div>
        <Link href="/student/practicas/nueva">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nueva solicitud
          </Button>
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: 'Práctica actual',
            value: practicaActual?.oferta?.titulo ? practicaActual.oferta.titulo.substring(0, 20) + '...' : 'Sin práctica',
            status: practicaActual ? 'active' : 'pending' as const
          },
          {
            label: 'Horas acumuladas',
            value: `${practicaActual?.seguimiento?.reduce((acc: number, s: any) => acc + (s.horas || 0), 0) || 0}h`,
            status: 'completed' as const
          },
          { label: 'Prácticas completadas', value: '0', status: 'completed' as const },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-card rounded-xl border border-border shadow-soft"
          >
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-semibold text-foreground">{stat.value}</p>
              <StatusBadge variant={stat.status as any} size="sm">
                {stat.status === 'active' ? 'En curso' : 'Pendiente'}
              </StatusBadge>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar prácticas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filtros.map((filtro) => (
            <Button
              key={filtro}
              variant={filtroActivo === filtro ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroActivo(filtro)}
            >
              {filtro}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Prácticas Grid */}
      {practicasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {practicasFiltradas.map((practica, index) => (
              <motion.div
                key={practica.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-card rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {typeof practica.empresa === 'string' ? practica.empresa : practica.empresa?.razonSocial || 'Empresa no especificada'}
                        </h3>
                        <p className="text-sm text-muted-foreground">{practica.cargo}</p>
                      </div>
                    </div>
                    <StatusBadge
                      variant={practica._calculatedState === 'starting_soon' ? 'pending' : 
                               practica.estado === 'approved' ? 'pending' : practica.estado as any}
                      pulse={practica.estado === 'active' && practica._hasStarted !== false}
                    >
                      {practica._calculatedState === 'starting_soon' ? `Por iniciar (${practica._daysUntilStart} días)` :
                       practica.estado === 'active' ? 'Activo' : 
                       practica.estado === 'completed' ? 'Completado' : 
                       practica.estado === 'approved' ? 'Aprobado (Por iniciar)' : 
                       practica.estado === 'rejected' ? 'Rechazado' : 'Pendiente'}
                    </StatusBadge>
                  </div>
                </div>

                {/* Progress */}
                <div className="px-6 py-4 bg-muted/50">
                  {practica._calculatedState === 'starting_soon' ? (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        Inicio de práctica
                      </span>
                      <span className="text-sm font-semibold text-amber-600">
                        En {practica._daysUntilStart} días
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          Progreso
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {practica.progreso}%
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${practica.progreso}%` }}
                          transition={{ duration: 0.8, delay: 0.2 }}
                          className={`h-full rounded-full ${
                            practica.progreso === 100 ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Details */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-muted-foreground/60" />
                    <span>
                      {new Date(practica.fechaInicio).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' - '}
                      {new Date(practica.fechaFin).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-muted-foreground/60" />
                    <span>
                      {practica.horas}/{practica.horasTotales}h
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 text-muted-foreground/60" />
                    <span>
                      {practica.documentos}/{practica.documentosTotales} docs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-muted-foreground/60" />
                    <span>{practica.supervisor}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-border flex items-center justify-between">
                  <Link href={`/student/practicas/${practica.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                      Ver detalles
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No hay prácticas"
          description="Aún no has registrado ninguna práctica preprofesional."
          action={{
            label: 'Iniciar solicitud',
            onClick: () => {},
          }}
        />
      )}
    </motion.div>
  );
}

