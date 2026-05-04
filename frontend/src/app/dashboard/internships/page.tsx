"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Briefcase, Plus, Search, Building2, Calendar, Edit, Trash2, Eye, Check, MoreHorizontal, AlertCircle, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { CardSkeleton } from "@/components/student/LoadingState";
import { API_URL, estadoColors, fetchWithAuth } from "./_lib/offers";
import type { Offer } from "./_lib/offers";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

interface ConfirmAction {
  type: 'delete' | 'publish' | null;
  offerId: number | null;
  title: string;
  description: string;
}

export default function InternshipsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todas");
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    type: null,
    offerId: null,
    title: '',
    description: '',
  });

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`${API_URL}/api/internships/offers`);
      // Handle paginated response: { data: [...], total, page, limit, totalPages }
      const offersArray = data?.data || (Array.isArray(data) ? data : []);
      setOffers(offersArray);
      setError(null);
    } catch (err: any) {
      console.error('Error loading offers:', err);
      setError(err.message);
      setOffers([]); // Ensure offers is always an array even on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const showDeleteConfirm = (id: number, title: string) => {
    setConfirmAction({
      type: 'delete',
      offerId: id,
      title: 'Cancelar oferta',
      description: `¿Estás seguro de que deseas cancelar la oferta "${title}"? Los cambios se guardarán pero la oferta no será visible.`,
    });
  };

  const showPublishConfirm = (id: number, title: string) => {
    setConfirmAction({
      type: 'publish',
      offerId: id,
      title: 'Publicar oferta',
      description: `¿Deseas publicar la oferta "${title}"? Una vez publicada, los estudiantes podrán postularse.`,
    });
  };

  const handleDelete = async () => {
    if (!confirmAction.offerId) return;
    const id = confirmAction.offerId;
    setConfirmAction({ type: null, offerId: null, title: '', description: '' });

    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, {
        method: "DELETE",
      });
      toast({ 
        title: "Éxito", 
        description: "La oferta fue cancelada exitosamente.",
        variant: "default"
      });
      loadOffers();
    } catch (err: any) {
      toast({ 
        title: "No se pudo cancelar la oferta", 
        description: err.message,
        variant: "destructive" 
      });
    }
  };

  const handlePublish = async () => {
    if (!confirmAction.offerId) return;
    const id = confirmAction.offerId;
    setConfirmAction({ type: null, offerId: null, title: '', description: '' });

    try {
      await fetchWithAuth(`${API_URL}/api/internships/offers/${id}/publish`, {
        method: "PATCH",
      });
      toast({ 
        title: "Éxito", 
        description: "La oferta fue publicada exitosamente.",
        variant: "default"
      });
      loadOffers();
    } catch (err: any) {
      toast({ 
        title: "Error al publicar oferta", 
        description: err.message || "No se pudo publicar la oferta.",
        variant: "destructive" 
      });
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction.type === 'delete') {
      handleDelete();
    } else if (confirmAction.type === 'publish') {
      handlePublish();
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch =
      offer.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offer.empresa?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todas" || offer.estado === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: "todas", label: "Todas", color: "bg-muted text-muted-foreground" },
    { value: "borrador", label: "Borradores", color: "bg-muted text-muted-foreground" },
    { value: "publicada", label: "Publicadas", color: "bg-blue-500/20 text-blue-600 dark:text-blue-400" },
    { value: "cerrada", label: "Cerradas", color: "bg-amber-500/20 text-amber-600 dark:text-amber-400" },
    { value: "cancelada", label: "Canceladas", color: "bg-red-500/20 text-red-600 dark:text-red-400" },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar ofertas: {error}</p>
        <Button onClick={loadOffers} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Prácticas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de ofertas de prácticas preprofesionales</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link href="/dashboard/internships/new">
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
                  ? `${option.color} ring-1 ring-current font-medium`
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {option.label}
            </button>
          ))}
          {(searchTerm || statusFilter !== "todas") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("todas");
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
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">{offer.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{offer.empresa?.razonSocial || "Empresa no especificada"}</span>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className={`px-2 py-1 text-xs rounded ${estadoColors[offer.estado] || "bg-muted text-muted-foreground"}`}>
                        {offer.estado}
                      </span>
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                        {offer.cupos} cupos
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground mr-4">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} - {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
                  </div>
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <Link
                        href={`/dashboard/internships/${offer.id}`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Ver detalle
                      </Link>
                      <Link
                        href={`/dashboard/internships/${offer.id}/edit`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      {offer.estado === "borrador" && (
                        <button
                          onClick={() => showPublishConfirm(offer.id, offer.titulo)}
                          className="w-full px-3 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-muted flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" /> Publicar
                        </button>
                      )}
                      {offer.estado !== "cancelada" && (
                        <button
                          onClick={() => showDeleteConfirm(offer.id, offer.titulo)}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-muted flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Eliminar
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
            {(searchTerm || statusFilter !== "todas") && (
              <p className="text-sm mt-2 opacity-70">
                Intenta ajustar los filtros de búsqueda
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.type && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ type: null, offerId: null, title: '', description: '' })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{confirmAction.title}</h3>
                  <p className="text-muted-foreground text-sm mt-2">{confirmAction.description}</p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ type: null, offerId: null, title: '', description: '' })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  className={confirmAction.type === 'delete' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
                >
                  {confirmAction.type === 'delete' ? 'Cancelar oferta' : 'Publicar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
