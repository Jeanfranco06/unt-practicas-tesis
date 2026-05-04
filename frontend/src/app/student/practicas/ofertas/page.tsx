'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Building2,
  Calendar,
  Users,
  MapPin,
  CheckCircle,
  Clock,
  ArrowLeft,
  Filter,
  X,
  FileText,
  Upload,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { StatusBadge } from '@/components/student/StatusBadge';
import { CardSkeleton } from '@/components/student/LoadingState';
import { EmptyState } from '@/components/student/EmptyState';
import Link from 'next/link';
import { API_URL, fetchWithAuth } from '@/app/dashboard/internships/_lib/offers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface Offer {
  id: number;
  titulo: string;
  descripcion: string;
  requisitos: string;
  empresa: { id: number; razonSocial: string; nombreComercial?: string };
  cupos: number;
  fechaInicioPostulacion: string;
  fechaFinPostulacion: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
  estado: string;
}

interface Application {
  id: number;
  ofertaId: number;
  estado: 'postulado' | 'preseleccionado' | 'rechazado' | 'aprobado';
  oferta?: Offer;
}

export default function OfertasPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cartaPresentacion: '',
    cvFile: null as File | null,
    cvUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myApplications, setMyApplications] = useState<Application[]>([]);

  useEffect(() => {
    loadOffers();
    loadMyApplications();
  }, []);

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`${API_URL}/api/internships/offers`);
      const list = Array.isArray(data) ? data : (data?.data ?? []);
      // Filtrar solo ofertas publicadas y no vencidas
      const now = new Date();
      const validOffers = list.filter((o: Offer) => {
        const finPostulacion = new Date(o.fechaFinPostulacion);
        return o.estado === 'publicada' && finPostulacion >= now;
      });
      setOffers(validOffers);
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

  const loadMyApplications = async () => {
    try {
      const data = await fetchWithAuth(`${API_URL}/api/internships/my-applications`);
      const apps = Array.isArray(data) ? data : (data?.data ?? []);
      setMyApplications(apps);
    } catch (err: any) {
      // Silencioso - no mostrar error si falla la carga de postulaciones
      console.error('Error cargando postulaciones:', err);
    }
  };

  const getApplicationForOffer = (offerId: number): Application | undefined => {
    return myApplications.find((app) => app.ofertaId === offerId);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOffer) return;

    setIsSubmitting(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('ofertaId', selectedOffer.id.toString());
      formData.append('cartaPresentacion', applicationData.cartaPresentacion);
      
      // Add CV file if provided
      if (applicationData.cvFile) {
        formData.append('cvFile', applicationData.cvFile);
      } else if (applicationData.cvUrl && applicationData.cvUrl.trim()) {
        // Fallback to URL if no file but URL provided
        formData.append('documentoCvUrl', applicationData.cvUrl.trim());
      }

      await fetchWithAuth(`${API_URL}/api/internships/applications`, {
        method: 'POST',
        body: formData, // Don't set Content-Type header, let browser set it with boundary
      });

      toast({
        title: 'Postulación enviada',
        description: `Te has postulado exitosamente a ${selectedOffer.titulo}`,
      });

      setShowApplyModal(false);
      setSelectedOffer(null);
      setApplicationData({ cartaPresentacion: '', cvFile: null, cvUrl: '' });
      // Actualizar lista de postulaciones para deshabilitar el botón
      await loadMyApplications();
    } catch (err: any) {
      toast({
        title: 'Error al postular',
        description: err.message || 'No se pudo enviar la postulación',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOffers = offers.filter((offer) => {
    const search = searchTerm.toLowerCase();
    return (
      offer.titulo?.toLowerCase().includes(search) ||
      offer.empresa?.razonSocial?.toLowerCase().includes(search) ||
      offer.descripcion?.toLowerCase().includes(search)
    );
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 min-h-[calc(100vh-8rem)] flex flex-col">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {[1, 2, 3, 4].map((i) => (
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
      className="space-y-6 min-h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2">
            <Link href="/student/practicas">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a prácticas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Ofertas de Práctica</h1>
          <p className="text-muted-foreground mt-1">
            Explora las oportunidades disponibles y postula a las que cumplas los requisitos
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar ofertas por título, empresa o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>
        {searchTerm && (
          <Button variant="ghost" size="sm" onClick={() => setSearchTerm('')}>
            <X className="w-4 h-4 mr-2" />
            Limpiar
          </Button>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-foreground">{offers.length}</p>
          <p className="text-sm text-muted-foreground">Ofertas disponibles</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-2xl font-bold text-foreground">
            {offers.reduce((acc, o) => acc + (o.cupos || 0), 0)}
          </p>
          <p className="text-sm text-muted-foreground">Cupos totales</p>
        </div>
      </motion.div>

      {/* Offers Grid */}
      {filteredOffers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 flex-1">
          <AnimatePresence>
            {filteredOffers.map((offer) => {
              const existingApp = getApplicationForOffer(offer.id);
              const isApplied = !!existingApp;

              return (
                <motion.div
                  key={offer.id}
                  variants={itemVariants}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Card Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">{offer.titulo}</h3>
                          <p className="text-sm text-muted-foreground">{offer.empresa?.razonSocial}</p>
                        </div>
                      </div>
                      {isApplied ? (
                        <StatusBadge variant="active" size="sm">
                          <Check className="w-3 h-3 mr-1" />
                          Postulado
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="active" size="sm">
                          {getDaysLeft(offer.fechaFinPostulacion)} días restantes
                        </StatusBadge>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-4 flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-2">{offer.descripcion}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>{offer.cupos} cupos</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Inicia: {formatDate(offer.fechaInicioPractica)}</span>
                      </div>
                    </div>

                    {offer.requisitos && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Requisitos:</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{offer.requisitos}</p>
                      </div>
                    )}

                    {/* Postulation Period */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-500/10 rounded-lg p-2">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>
                        Postulaciones: {formatDate(offer.fechaInicioPostulacion)} - {formatDate(offer.fechaFinPostulacion)}
                      </span>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-6 py-4 border-t border-border bg-muted/30">
                    {isApplied ? (
                      <Button
                        className="w-full"
                        disabled
                        variant="secondary"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {existingApp?.estado === 'aprobado'
                          ? 'Postulación aprobada'
                          : existingApp?.estado === 'rechazado'
                          ? 'Postulación rechazada'
                          : 'Ya postulaste a esta oferta'}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedOffer(offer);
                          setShowApplyModal(true);
                        }}
                      >
                        <Briefcase className="w-4 h-4 mr-2" />
                        Postular ahora
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No hay ofertas disponibles"
          description={
            searchTerm
              ? 'No se encontraron ofertas que coincidan con tu búsqueda'
              : 'En este momento no hay ofertas de práctica disponibles. Vuelve a revisar más tarde.'
          }
          action={
            searchTerm
              ? { label: 'Limpiar búsqueda', onClick: () => setSearchTerm('') }
              : undefined
          }
        />
      )}

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && selectedOffer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowApplyModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <form onSubmit={handleApply} className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Postular a práctica</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedOffer.titulo} - {selectedOffer.empresa?.razonSocial}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="carta" className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Carta de presentación
                    </Label>
                    <Textarea
                      id="carta"
                      placeholder="Describe por qué te interesa esta práctica y qué puedes aportar..."
                      rows={4}
                      value={applicationData.cartaPresentacion}
                      onChange={(e) =>
                        setApplicationData((prev) => ({ ...prev, cartaPresentacion: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv" className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Tu CV (opcional)
                    </Label>
                    <Input
                      id="cv"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setApplicationData((prev) => ({ 
                            ...prev, 
                            cvFile: file,
                            cvUrl: '' // Clear URL when file is selected
                          }));
                        }
                      }}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sube tu CV en formato PDF, DOC o DOCX (máximo 5MB)
                    </p>
                    
                    {/* Fallback URL input */}
                    <div className="mt-3 pt-3 border-t border-border">
                      <Label htmlFor="cvUrl" className="text-xs text-muted-foreground">
                        O si prefieres, puedes pegar un enlace a tu CV:
                      </Label>
                      <Input
                        id="cvUrl"
                        type="url"
                        placeholder="https://ejemplo.com/tu-cv.pdf"
                        value={applicationData.cvUrl}
                        onChange={(e) => {
                          setApplicationData((prev) => ({ 
                            ...prev, 
                            cvUrl: e.target.value,
                            cvFile: null // Clear file when URL is entered
                          }));
                        }}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowApplyModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Confirmar postulación'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
