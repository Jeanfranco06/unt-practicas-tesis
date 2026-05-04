'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle,
  Search,
  XCircle,
  Loader2,
  ArrowLeft,
  ClipboardList,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { LoadingState } from '@/components/student/LoadingState';
import { estadoColors } from '@/app/dashboard/internships/_lib/offers';
import type { Offer } from '@/app/dashboard/internships/_lib/offers';
import {
  getDraftOffers,
  publishInternshipOffer,
  rejectInternshipOffer,
} from '../_lib/api';
import { useRouter } from 'next/navigation';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 28 } },
};

export default function CoordinatorOffersPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionId, setActionId] = useState<number | null>(null);

  const load = async () => {
    try {
      setIsLoading(true);
      const data = await getDraftOffers();
      setOffers(data);
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
    load();
  }, []);

  const handlePublish = async (id: number) => {
    try {
      setActionId(id);
      await publishInternshipOffer(id);
      toast({ title: 'Oferta aprobada', description: 'La oferta quedó publicada y visible para los estudiantes.' });
      load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo publicar la oferta', variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: number, titulo: string) => {
    if (!confirm(`¿Rechazar la oferta "${titulo}"? Quedará cancelada y no podrá publicarse.`)) return;
    try {
      setActionId(id);
      await rejectInternshipOffer(id);
      toast({ title: 'Oferta rechazada', description: 'La oferta fue dada de baja.' });
      load();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo rechazar la oferta', variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const filtered = offers.filter(
    (o) =>
      o.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.empresa?.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-72 bg-muted rounded animate-pulse" />
        <LoadingState rows={4} />
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
      <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Button variant="ghost" className="w-fit -ml-2 gap-1 text-muted-foreground" onClick={() => router.push('/dashboard/coordinator')}>
            <ArrowLeft className="w-4 h-4" />
            Panel coordinador
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Aprobar ofertas de práctica</h1>
              <p className="text-muted-foreground text-sm">
                Las empresas registran ofertas en borrador; aquí las apruebas para publicarlas o las rechazas.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por título o empresa..."
          className="pl-9 max-w-md"
        />
      </motion.div>

      {filtered.length === 0 ? (
        <motion.div variants={itemVariants} className="rounded-xl border border-border bg-card p-10 text-center">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="font-medium text-foreground">No hay ofertas pendientes de aprobación</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando una empresa cree una oferta en borrador, aparecerá aquí.
          </p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((offer) => (
            <motion.div
              key={offer.id}
              variants={itemVariants}
              className="rounded-xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">{offer.titulo}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded ${estadoColors[offer.estado] ?? ''}`}>
                      {offer.estado}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      {offer.empresa?.razonSocial ?? 'Empresa'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      {offer.cupos} cupo{offer.cupos !== 1 ? 's' : ''}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      Postulación:{' '}
                      {new Date(offer.fechaInicioPostulacion).toLocaleDateString()} —{' '}
                      {new Date(offer.fechaFinPostulacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button size="sm" className="gap-1.5" disabled={actionId === offer.id} onClick={() => handlePublish(offer.id)}>
                    {actionId === offer.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Aprobar y publicar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                    disabled={actionId === offer.id}
                    onClick={() => handleReject(offer.id, offer.titulo)}
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/dashboard/internships/${offer.id}`}>Ver detalle</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
