'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  Filter,
  X,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from '../_lib/api';
import type { Agreement } from '../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const statusOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'vigente', label: 'Vigentes', color: 'bg-emerald-500/20 text-emerald-600' },
  { value: 'vencido', label: 'Vencidos', color: 'bg-red-500/20 text-red-600' },
  { value: 'renovado', label: 'Renovados', color: 'bg-blue-500/20 text-blue-600' },
];

const typeOptions = [
  { value: 'todos', label: 'Todos los tipos' },
  { value: 'marco', label: 'Convenio Marco' },
  { value: 'especifico', label: 'Convenio Específico' },
];

export default function CompanyAgreementsPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  useEffect(() => {
    const getEmpresaId = async () => {
      const storedEmpresaId = localStorage.getItem('empresaId');
      if (storedEmpresaId) {
        setEmpresaId(storedEmpresaId);
        return;
      }
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
      if (!empresaId) setIsLoading(false);
    };
    if (isAuthenticated) {
      getEmpresaId();
    }
  }, [user, isAuthenticated]);

  const loadAgreements = async () => {
    if (!empresaId) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(
        `${API_URL}/api/agreements/company/${empresaId}`
      );
      setAgreements(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar los convenios',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      loadAgreements();
    }
  }, [empresaId]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'bg-emerald-500/20 text-emerald-600';
      case 'vencido':
        return 'bg-red-500/20 text-red-600';
      case 'renovado':
        return 'bg-blue-500/20 text-blue-600';
      default:
        return 'bg-slate-500/20 text-slate-600';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'Vigente';
      case 'vencido':
        return 'Vencido';
      case 'renovado':
        return 'Renovado';
      default:
        return estado;
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'marco':
        return 'Convenio Marco';
      case 'especifico':
        return 'Convenio Específico';
      default:
        return tipo;
    }
  };

  const isExpiringSoon = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const isExpired = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    return vencimiento < hoy;
  };

  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch =
      agreement.objetoContrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTypeLabel(agreement.tipo).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'todas' || agreement.estado === statusFilter;
    const matchesType = typeFilter === 'todos' || agreement.tipo === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const stats = {
    total: agreements.length,
    vigentes: agreements.filter((a) => a.estado === 'vigente').length,
    vencidos: agreements.filter((a) => a.estado === 'vencido').length,
    proximosAVencer: agreements.filter((a) => a.estado === 'vigente' && isExpiringSoon(a.fechaVencimiento)).length,
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Convenios con la Universidad</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona los convenios y acuerdos vigentes con la UNT
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-primary' },
          { label: 'Vigentes', value: stats.vigentes, color: 'bg-emerald-500' },
          { label: 'Vencidos', value: stats.vencidos, color: 'bg-red-500' },
          { label: 'Próximos a vencer', value: stats.proximosAVencer, color: 'bg-amber-500' },
        ].map((stat) => (
          <div key={stat.label} className="p-3 bg-card rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color.replace('bg-', 'text-')}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar convenios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground text-sm mr-1">
            <Filter className="w-4 h-4" />
            <span>Estado:</span>
          </div>
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                statusFilter === option.value
                  ? `${option.color || 'bg-muted text-muted-foreground'} ring-1 ring-current font-medium`
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-full bg-muted text-muted-foreground border-none focus:ring-1 focus:ring-primary"
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {(searchTerm || statusFilter !== 'todas' || typeFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todas');
                setTypeFilter('todos');
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      {/* Agreements List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredAgreements.map((agreement) => (
            <motion.div
              key={agreement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-foreground">
                        {getTypeLabel(agreement.tipo)}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(agreement.estado)}`}>
                        {getStatusLabel(agreement.estado)}
                      </span>
                      {isExpiringSoon(agreement.fechaVencimiento) && agreement.estado === 'vigente' && (
                        <span className="px-2 py-0.5 text-xs rounded bg-amber-500/20 text-amber-600 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Próximo a vencer
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mt-2">{agreement.objetoContrato}</p>
                    <div className="flex flex-wrap gap-3 mt-3 text-xs">
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Inicio: {new Date(agreement.fechaInicio).toLocaleDateString()}
                      </span>
                      <span className={`px-2 py-1 rounded flex items-center gap-1 ${
                        isExpired(agreement.fechaVencimiento) 
                          ? 'bg-red-500/20 text-red-600' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <Clock className="w-3 h-3" />
                        Vencimiento: {new Date(agreement.fechaVencimiento).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {agreement.documentoUrl && (
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Descargar
                    </Button>
                  )}
                  {agreement.estado === 'vigente' && isExpiringSoon(agreement.fechaVencimiento) && (
                    <Button
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-white"
                      onClick={() => {
                        toast({
                          title: 'Solicitud de renovación',
                          description: 'Para renovar el convenio, contacta al coordinador de prácticas de la facultad.',
                        });
                      }}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Solicitar renovación
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredAgreements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron convenios</p>
            {(searchTerm || statusFilter !== 'todas' || typeFilter !== 'todos') && (
              <p className="text-sm mt-2 opacity-70">Intenta ajustar los filtros de búsqueda</p>
            )}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
              <p className="text-sm">
                Los convenios son gestionados por el coordinador de prácticas. 
                Si necesitas establecer un nuevo convenio, contacta a la facultad.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
