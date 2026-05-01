'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Edit, Trash2, Phone, Mail, MapPin, User, Calendar, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { API_URL, fetchWithAuth } from '../_lib/companies';
import type { Company } from '../_lib/companies';

interface ConfirmAction {
  show: boolean;
  action: 'delete' | null;
}

export default function CompanyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ show: false, action: null });

  useEffect(() => {
    const loadCompany = async () => {
      try {
        setIsLoading(true);
        const data = await fetchWithAuth(`${API_URL}/api/companies/${id}`);
        setCompany(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Error al cargar empresa');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) loadCompany();
  }, [id]);

  const handleDelete = async () => {
    setConfirmAction({ show: false, action: null });
    try {
      await fetchWithAuth(`${API_URL}/api/companies/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'La empresa fue eliminada exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/companies');
    } catch (err: any) {
      toast({
        title: 'No se pudo eliminar la empresa',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = () => {
    setConfirmAction({ show: true, action: 'delete' });
  };

  if (isLoading) return <div className="text-muted-foreground">Cargando empresa...</div>;

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar empresa: {error}</p>
      </div>
    );
  }

  if (!company) return <div className="text-muted-foreground">Empresa no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button asChild variant="ghost" className="mb-3 text-muted-foreground hover:text-foreground">
            <Link href="/dashboard/companies">
              <ArrowLeft className="w-4 h-4 mr-2" /> Volver a empresas
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Detalle de Empresa</h1>
          <p className="text-muted-foreground text-sm mt-1">Información completa de la empresa</p>
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
            <Link href={`/dashboard/companies/${company.id}/edit`}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Link>
          </Button>
          <Button onClick={showDeleteConfirm} variant="outline" className="border-red-500/40 text-red-600 dark:text-red-400 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </Button>
        </div>
      </div>

      <section className="bg-card border border-border rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-foreground">
                {company.nombreComercial || company.razonSocial}
              </h2>
              <p className="text-muted-foreground text-sm">{company.razonSocial}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                  RUC: {company.ruc}
                </span>
                {company.activo ? (
                  <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs rounded flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Activa
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-slate-500/20 text-slate-400 text-xs rounded flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Inactiva
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-border">
            {company.direccion && (
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Dirección
                </Label>
                <p className="text-foreground text-sm mt-2">{company.direccion}</p>
              </div>
            )}
            {company.telefono && (
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Teléfono
                </Label>
                <p className="text-foreground text-sm mt-2">{company.telefono}</p>
              </div>
            )}
            {company.emailContacto && (
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email de Contacto
                </Label>
                <p className="text-foreground text-sm mt-2">{company.emailContacto}</p>
              </div>
            )}
            {company.representanteNombre && (
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-muted-foreground text-sm flex items-center gap-2">
                  <User className="w-4 h-4" /> Representante Legal
                </Label>
                <p className="text-foreground text-sm mt-2">{company.representanteNombre}</p>
              </div>
            )}
          </div>

          <div className="p-4 rounded-lg bg-muted/50 pt-4 border-t border-border">
            <Label className="text-muted-foreground text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Fecha de Registro
            </Label>
            <p className="text-foreground text-sm mt-2">
              {new Date(company.creadoEn).toLocaleDateString()}
            </p>
          </div>

          {/* Convenios */}
          {company.convenios && company.convenios.length > 0 && (
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground text-sm mb-3 block">Convenios</Label>
              <div className="space-y-2">
                {company.convenios.map((convenio: any) => (
                  <div key={convenio.id} className="flex items-center gap-2 text-sm">
                    <span className="text-foreground">Convenio #{convenio.id}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${convenio.estado === 'activo' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {convenio.estado}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ofertas */}
          {company.ofertas && company.ofertas.length > 0 && (
            <div className="pt-4 border-t border-border">
              <Label className="text-muted-foreground text-sm mb-3 block">Ofertas de Prácticas</Label>
              <div className="space-y-2">
                {company.ofertas.slice(0, 5).map((oferta: any) => (
                  <div key={oferta.id} className="flex items-center gap-2 text-sm">
                    <span className="text-foreground">{oferta.titulo}</span>
                    <span className={`px-2 py-0.5 text-xs rounded ${oferta.estado === 'publicada' ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {oferta.estado}
                    </span>
                  </div>
                ))}
                {company.ofertas.length > 5 && (
                  <p className="text-xs text-muted-foreground">+{company.ofertas.length - 5} ofertas más</p>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Confirmation Dialog */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ show: false, action: null })}
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
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">Eliminar empresa</h3>
                  <p className="text-muted-foreground text-sm mt-2">
                    ¿Estás seguro de que deseas eliminar la empresa "{company?.nombreComercial || company?.razonSocial}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, action: null })}
                  variant="outline"
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancelar
                </Button>
                <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white">
                  Eliminar
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
