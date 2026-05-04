'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, Eye, AlertCircle, Filter, X, Building2, Mail, Phone, Briefcase, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import {
  getRepresentatives,
  deleteRepresentative,
  activateRepresentative,
  getFullName,
  getInitials,
  getAvatarColor,
  type CompanyRepresentative,
} from './_lib/representatives';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function RepresentativesPage() {
  const { toast } = useToast();
  const [representatives, setRepresentatives] = useState<CompanyRepresentative[]>([]);
  const [filteredRepresentatives, setFilteredRepresentatives] = useState<CompanyRepresentative[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ show: boolean; representativeId: number | null; title: string; type: 'delete' | 'activate' }>({ show: false, representativeId: null, title: '', type: 'delete' });

  useEffect(() => {
    loadRepresentatives();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = representatives.filter((rep) =>
      getFullName(rep).toLowerCase().includes(term) ||
      rep.usuario?.email?.toLowerCase().includes(term) ||
      rep.empresa?.razonSocial?.toLowerCase().includes(term) ||
      rep.cargo?.toLowerCase().includes(term) ||
      rep.departamento?.toLowerCase().includes(term)
    );
    setFilteredRepresentatives(filtered);
  }, [searchTerm, representatives]);

  const loadRepresentatives = async () => {
    try {
      setIsLoading(true);
      const data = await getRepresentatives();
      setRepresentatives(data);
      setFilteredRepresentatives(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error al cargar representantes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showDeleteConfirm = (rep: CompanyRepresentative) => {
    const isActive = rep.usuario?.activo !== false;
    setConfirmAction({
      show: true,
      representativeId: rep.id,
      title: isActive ? `¿Desactivar a ${getFullName(rep)}?` : `¿Activar a ${getFullName(rep)}?`,
      type: isActive ? 'delete' : 'activate',
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmAction.representativeId) return;

    setConfirmAction({ ...confirmAction, show: false });

    try {
      if (confirmAction.type === 'delete') {
        await deleteRepresentative(confirmAction.representativeId);
        toast({
          title: 'Representante desactivado',
          description: 'El representante ha sido desactivado exitosamente.',
        });
      } else {
        await activateRepresentative(confirmAction.representativeId);
        toast({
          title: 'Representante activado',
          description: 'El representante ha sido activado exitosamente.',
        });
      }
      loadRepresentatives();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo completar la acción',
        variant: 'destructive',
      });
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-8 h-8 text-amber-500" />
            Representantes de Empresas
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los representantes de empresas asociadas
          </p>
        </div>
        <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all">
          <Link href="/dashboard/users/new/representative">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Representante
          </Link>
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email, empresa, cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>

      {/* Representatives List */}
      <motion.div variants={itemVariants} className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredRepresentatives.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-border">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchTerm ? 'No se encontraron representantes' : 'No hay representantes registrados'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              {searchTerm
                ? 'Intenta con otros términos de búsqueda'
                : 'Los representantes de empresas se crean desde la gestión de usuarios'}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Link href="/dashboard/users/new/representative">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primer Representante
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <AnimatePresence>
            {filteredRepresentatives.map((rep) => (
              <motion.div
                key={rep.id}
                variants={itemVariants}
                layout
                className={`group bg-card rounded-xl border p-4 hover:shadow-md transition-shadow ${rep.usuario?.activo === false ? 'border-red-200 dark:border-red-800 opacity-75' : 'border-border'}`}
              >
                <div className="flex items-start gap-4">
                  <Link href={`/dashboard/representatives/${rep.id}`} className="flex items-start gap-4 flex-1 hover:opacity-80 transition-opacity">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(rep)} flex items-center justify-center text-white font-semibold flex-shrink-0`}>
                      {getInitials(rep)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground text-lg">
                          {getFullName(rep)}
                        </h3>
                        {rep.usuario?.activo === false && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                            Inactivo
                          </span>
                        )}
                        {rep.esPrincipal && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                        {rep.usuario?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {rep.usuario.email}
                          </span>
                        )}
                        {rep.empresa?.razonSocial && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {rep.empresa.razonSocial}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        {rep.cargo && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {rep.cargo}
                          </span>
                        )}
                        {rep.departamento && (
                          <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                            {rep.departamento}
                          </span>
                        )}
                      </div>
                      {rep.telefonoDirecto && (
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {rep.telefonoDirecto}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted"
                    >
                      <Link href={`/dashboard/representatives/${rep.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="border-border hover:bg-muted"
                    >
                      <Link href={`/dashboard/representatives/${rep.id}/edit`}>
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showDeleteConfirm(rep)}
                      className={rep.usuario?.activo === false
                        ? "border-emerald-200 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950/20 dark:text-emerald-400"
                        : "border-red-200 hover:bg-red-50 text-red-600 dark:border-red-800 dark:hover:bg-red-950/20 dark:text-red-400"
                      }
                    >
                      {rep.usuario?.activo === false ? (
                        <>
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activar
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Desactivar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction.show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmAction({ ...confirmAction, show: false })}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-lg"
            >
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {confirmAction.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                {confirmAction.type === 'delete'
                  ? 'El representante será marcado como inactivo y no podrá acceder al sistema.'
                  : 'El representante será reactivado y podrá acceder al sistema nuevamente.'}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setConfirmAction({ ...confirmAction, show: false })}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmAction}
                  className={confirmAction.type === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
                >
                  {confirmAction.type === 'delete' ? 'Desactivar' : 'Activar'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
