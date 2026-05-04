'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  AlertCircle,
  Filter,
  X,
  Calendar,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from '../_lib/api';
import type { InternshipOffer } from '../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface ConfirmAction {
  show: boolean;
  offerId: number | null;
  title: string;
}

const statusOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'borrador', label: 'Borradores', color: 'bg-slate-500/20 text-slate-600' },
  { value: 'publicada', label: 'Publicadas', color: 'bg-emerald-500/20 text-emerald-600' },
  { value: 'cerrada', label: 'Cerradas', color: 'bg-amber-500/20 text-amber-600' },
  { value: 'cancelada', label: 'Canceladas', color: 'bg-red-500/20 text-red-600' },
];

export default function CompanyOffersPage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [offers, setOffers] = useState<InternshipOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    offerId: null,
    title: '',
  });

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

  const loadOffers = async () => {
    if (!empresaId) return;
    try {
      setIsLoading(true);
      const statusParam = statusFilter !== 'todas' ? `&estado=${statusFilter}` : '';
      const data = await fetchWithAuth(
        `${API_URL}/api/internships/offers?empresaId=${empresaId}${statusParam}`
      );
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      setOffers(list);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar las ofertas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      loadOffers();
    }
  }, [empresaId, statusFilter]);

  const handleDelete = async () => {
    if (!confirmAction.offerId) return;
    const id = confirmAction.offerId;
    setConfirmAction({ show: false, offerId: null, title: '' });

    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'La oferta fue cancelada exitosamente.',
        variant: 'default',
      });
      loadOffers();
    } catch (err: any) {
      toast({
        title: 'No se pudo cancelar la oferta',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}/publish`, {
        method: 'PATCH',
      });
      toast({
        title: 'Éxito',
        description: 'La oferta fue publicada exitosamente.',
        variant: 'default',
      });
      loadOffers();
    } catch (err: any) {
      toast({
        title: 'No se pudo publicar la oferta',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = (id: number, title: string) => {
    setConfirmAction({
      show: true,
      offerId: id,
      title,
    });
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'bg-slate-500/20 text-slate-600';
      case 'publicada':
        return 'bg-emerald-500/20 text-emerald-600';
      case 'cerrada':
        return 'bg-amber-500/20 text-amber-600';
      case 'cancelada':
        return 'bg-red-500/20 text-red-600';
      default:
        return 'bg-slate-500/20 text-slate-600';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'borrador':
        return 'Borrador';
      case 'publicada':
        return 'Publicada';
      case 'cerrada':
        return 'Cerrada';
      case 'cancelada':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Ofertas de Prácticas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestiona las ofertas publicadas para estudiantes</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 text-white">
          <Link href="/dashboard/company/offers/new">
            <Plus className="h-4 w-4 mr-2" /> Nueva Oferta
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ofertas..."
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
          {(searchTerm || statusFilter !== 'todas') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todas');
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredOffers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-primary/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{offer.titulo}</h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">{offer.descripcion}</p>
                    <div className="flex flex-wrap gap-2 mt-3 text-xs">
                      <span className={`px-2 py-1 rounded ${getStatusColor(offer.estado)}`}>
                        {getStatusLabel(offer.estado)}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {offer.cupos} cupos
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Postulación: {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {offer.estado === 'borrador' && (
                    <Button
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                      onClick={() => handlePublish(offer.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Publicar
                    </Button>
                  )}
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <Link
                        href={`/dashboard/company/offers/${offer.id}`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Ver detalle
                      </Link>
                      <Link
                        href={`/dashboard/company/offers/${offer.id}/edit`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      {offer.estado !== 'cancelada' && (
                        <button
                          onClick={() => showDeleteConfirm(offer.id, offer.titulo)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-muted flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredOffers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron ofertas</p>
            {(searchTerm || statusFilter !== 'todas') && (
              <p className="text-sm mt-2 opacity-70">Intenta ajustar los filtros de búsqueda</p>
            )}
            <Button asChild className="mt-4 bg-primary hover:bg-primary/90 text-white">
              <Link href="/dashboard/company/offers/new">
                <Plus className="h-4 w-4 mr-2" /> Crear primera oferta
              </Link>
            </Button>
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, offerId: null, title: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Cancelar oferta</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas cancelar la oferta &quot;{confirmAction.title}&quot;? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, offerId: null, title: '' })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                  Confirmar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
