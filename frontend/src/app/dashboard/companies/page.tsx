'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Search, Phone, Mail, MapPin, Edit, Trash2, Eye, MoreHorizontal, AlertCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { API_URL, fetchWithAuth } from './_lib/companies';
import type { Company } from './_lib/companies';

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
  companyId: number | null;
  title: string;
}

const statusOptions = [
  { value: 'todas', label: 'Todas' },
  { value: 'activas', label: 'Activas', color: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  { value: 'inactivas', label: 'Inactivas', color: 'bg-slate-500/20 text-slate-400' },
];

export default function CompaniesPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todas');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    show: false,
    companyId: null,
    title: '',
  });

  const loadCompanies = async (incluirInactivas = false) => {
    try {
      setIsLoading(true);
      const url = incluirInactivas
        ? `${API_URL}/api/companies?incluirInactivas=true`
        : `${API_URL}/api/companies`;
      const data = await fetchWithAuth(url);
      setCompanies(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Cargar según el filtro de estado seleccionado
    loadCompanies(statusFilter === 'inactivas');
  }, [statusFilter]);

  const handleDelete = async () => {
    if (!confirmAction.companyId) return;
    const id = confirmAction.companyId;
    setConfirmAction({ show: false, companyId: null, title: '' });

    try {
      await fetchWithAuth(`${API_URL}/api/companies/${id}`, {
        method: 'DELETE',
      });
      toast({
        title: 'Éxito',
        description: 'La empresa fue eliminada exitosamente.',
        variant: 'default',
      });
      loadCompanies();
    } catch (err: any) {
      toast({
        title: 'No se pudo eliminar la empresa',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const showDeleteConfirm = (id: number, title: string) => {
    setConfirmAction({
      show: true,
      companyId: id,
      title,
    });
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.razonSocial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.nombreComercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.ruc?.includes(searchTerm);
    
    let matchesStatus = true;
    if (statusFilter === 'activas') matchesStatus = company.activo === true;
    else if (statusFilter === 'inactivas') matchesStatus = company.activo === false;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
        <p>Error al cargar empresas: {error}</p>
        <Button onClick={() => loadCompanies(statusFilter === 'inactivas')} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresas</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de empresas y convenios</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link href="/dashboard/companies/new">
            <Plus className="h-4 w-4 mr-2" /> Nueva Empresa
          </Link>
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar empresas..."
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
          {filteredCompanies.map((company) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {company.nombreComercial || company.razonSocial}
                    </h3>
                    <p className="text-muted-foreground text-sm">{company.razonSocial}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs">
                      <span className="px-2 py-1 bg-muted text-muted-foreground rounded">
                        RUC: {company.ruc}
                      </span>
                      {company.activo ? (
                        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded">
                          Activa
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded">
                          Inactiva
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-muted-foreground mr-4 space-y-1">
                    {company.telefono && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{company.telefono}</span>
                      </div>
                    )}
                    {company.emailContacto && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{company.emailContacto}</span>
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                      <Link
                        href={`/dashboard/companies/${company.id}`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Ver detalle
                      </Link>
                      <Link
                        href={`/dashboard/companies/${company.id}/edit`}
                        className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-muted flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      <button
                        onClick={() => showDeleteConfirm(company.id, company.nombreComercial || company.razonSocial)}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-muted flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No se encontraron empresas</p>
            {(searchTerm || statusFilter !== 'todas') && (
              <p className="text-sm mt-2 opacity-70">Intenta ajustar los filtros de búsqueda</p>
            )}
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
            onClick={() => setConfirmAction({ show: false, companyId: null, title: '' })}
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
                    ¿Estás seguro de que deseas eliminar la empresa "{confirmAction.title}"? Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  onClick={() => setConfirmAction({ show: false, companyId: null, title: '' })}
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
    </motion.div>
  );
}

