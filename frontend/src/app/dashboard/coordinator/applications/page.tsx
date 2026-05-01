'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  CheckCircle,
  XCircle,
  Briefcase,
  Calendar,
  Search,
  Filter,
  FileText,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import {
  getPendingApplications,
  reviewApplication,
} from './../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface Application {
  id: number;
  estado: string;
  fechaPostulacion: string;
  cartaPresentacion?: string;
  oferta: {
    id: number;
    titulo: string;
    empresa: {
      razonSocial: string;
    };
  };
  estudiante: {
    id: number;
    codigo: string;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
}

export default function ApplicationsPage() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [comentario, setComentario] = useState('');

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const data = await getPendingApplications();
      setApplications(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar las postulaciones',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleReview = async (id: number, estado: 'aprobado' | 'rechazado') => {
    try {
      setProcessingId(id);
      await reviewApplication(id, estado, comentario);
      toast({
        title: 'Éxito',
        description: `Postulación ${estado === 'aprobado' ? 'aprobada' : 'rechazada'} exitosamente`,
        variant: 'default',
      });
      setExpandedId(null);
      setComentario('');
      loadApplications();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo procesar la postulación',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = app.estudiante?.usuario
      ? `${app.estudiante.usuario.nombre} ${app.estudiante.usuario.apellidoPaterno}`.toLowerCase()
      : '';
    return (
      studentName.includes(searchLower) ||
      app.oferta?.titulo?.toLowerCase().includes(searchLower) ||
      app.oferta?.empresa?.razonSocial?.toLowerCase().includes(searchLower) ||
      app.estudiante?.codigo?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aprobación de Postulaciones</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Revisa y aprueba las postulaciones de los estudiantes a las ofertas de prácticas
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="text-sm font-medium text-amber-700">
            {applications.length} pendiente{applications.length !== 1 ? 's' : ''}
          </span>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por estudiante, oferta o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </motion.div>

      {/* Applications List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredApplications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-card rounded-xl border border-border"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500/40" />
              <h3 className="text-lg font-medium text-foreground">No hay postulaciones pendientes</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Todas las postulaciones han sido revisadas
              </p>
            </motion.div>
          ) : (
            filteredApplications.map((app) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {app.estudiante?.usuario
                            ? `${app.estudiante.usuario.nombre} ${app.estudiante.usuario.apellidoPaterno} ${app.estudiante.usuario.apellidoMaterno}`
                            : 'Estudiante no disponible'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Código: {app.estudiante?.codigo || 'N/A'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Briefcase className="w-4 h-4" />
                            {app.oferta?.titulo || 'Oferta no disponible'}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ExternalLink className="w-4 h-4" />
                            {app.oferta?.empresa?.razonSocial || 'Empresa no disponible'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(app.fechaPostulacion).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        {expandedId === app.id ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === app.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border bg-muted/20"
                    >
                      <div className="p-6 space-y-4">
                        {app.cartaPresentacion && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4" />
                              Carta de Presentación
                            </h4>
                            <p className="text-sm text-muted-foreground bg-background p-4 rounded-lg">
                              {app.cartaPresentacion}
                            </p>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-2">
                            Comentario (opcional)
                          </h4>
                          <textarea
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Agrega un comentario sobre tu decisión..."
                            className="w-full p-3 text-sm bg-background border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            rows={3}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <Button
                            onClick={() => handleReview(app.id, 'aprobado')}
                            disabled={processingId === app.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            {processingId === app.id ? 'Procesando...' : 'Aprobar Postulación'}
                          </Button>
                          <Button
                            onClick={() => handleReview(app.id, 'rechazado')}
                            disabled={processingId === app.id}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {processingId === app.id ? 'Procesando...' : 'Rechazar'}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
