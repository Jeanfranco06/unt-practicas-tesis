'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, AlertCircle, Building2, Briefcase, Phone, Mail, UserCheck, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  getRepresentative,
  deleteRepresentative,
  activateRepresentative,
  getFullName,
  getInitials,
  getAvatarColor,
  type CompanyRepresentative,
} from '../_lib/representatives';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function RepresentativeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const representativeId = Number(params.id);

  const [representative, setRepresentative] = useState<CompanyRepresentative | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'delete' | 'activate'>('delete');

  useEffect(() => {
    const loadRepresentative = async () => {
      try {
        setIsLoading(true);
        const data = await getRepresentative(representativeId);
        setRepresentative(data);
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadRepresentative();
  }, [representativeId]);

  const showDeleteConfirm = () => {
    setConfirmAction('delete');
    setShowConfirmModal(true);
  };

  const showActivateConfirm = () => {
    setConfirmAction('activate');
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    setShowConfirmModal(false);
    if (!representative) return;

    try {
      if (confirmAction === 'delete') {
        await deleteRepresentative(representativeId);
        toast({
          title: 'Representante desactivado',
          description: 'El representante ha sido desactivado exitosamente.',
        });
      } else {
        await activateRepresentative(representativeId);
        toast({
          title: 'Representante activado',
          description: 'El representante ha sido activado exitosamente.',
        });
      }
      router.push('/dashboard/representatives');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo completar la acción',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !representative) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error al cargar el representante: {error || 'No encontrado'}</span>
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/representatives">Volver a la lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  const isActive = representative.usuario?.activo !== false;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/representatives">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Representantes
          </Link>
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${getAvatarColor(representative)} flex items-center justify-center text-white font-semibold text-xl`}>
              {getInitials(representative)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {getFullName(representative)}
                </h1>
                {representative.esPrincipal && (
                  <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded-full flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    Principal
                  </span>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {representative.usuario?.email || 'Sin email'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="border-border hover:bg-muted">
              <Link href={`/dashboard/representatives/${representative.id}/edit`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </Button>
            {isActive ? (
              <Button
                variant="outline"
                onClick={showDeleteConfirm}
                className="border-red-200 hover:bg-red-50 text-red-600 dark:border-red-800 dark:hover:bg-red-950/20 dark:text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Desactivar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={showActivateConfirm}
                className="border-emerald-200 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:hover:bg-emerald-950/20 dark:text-emerald-400"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Activar
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Status Banner */}
      {!isActive && (
        <motion.div variants={itemVariants} className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Este representante está inactivo y no puede acceder al sistema.
          </p>
        </motion.div>
      )}

      {/* Info Cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* Company Info */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-500" />
            Información de la Empresa
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Razón Social</p>
              <p className="font-medium text-foreground mt-1">
                {representative.empresa?.razonSocial || 'No asignada'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RUC</p>
              <p className="font-medium text-foreground mt-1">
                {representative.empresa?.ruc || 'N/A'}
              </p>
            </div>
            {representative.empresa?.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email de la empresa</p>
                <p className="font-medium text-foreground mt-1">
                  {representative.empresa.email}
                </p>
              </div>
            )}
            {representative.empresa?.telefono && (
              <div>
                <p className="text-sm text-muted-foreground">Teléfono de la empresa</p>
                <p className="font-medium text-foreground mt-1">
                  {representative.empresa.telefono}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Professional Info */}
        <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-500" />
            Información Profesional
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Cargo</p>
              <p className="font-medium text-foreground mt-1">
                {representative.cargo || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Departamento</p>
              <p className="font-medium text-foreground mt-1">
                {representative.departamento || 'No especificado'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono Directo</p>
              <p className="font-medium text-foreground mt-1">
                {representative.telefonoDirecto || 'No especificado'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* User Info Link */}
      <motion.div variants={itemVariants} className="mt-6 p-4 bg-muted/50 rounded-xl">
        <p className="text-sm text-muted-foreground">
          Para gestionar los datos del usuario (nombre, email, contraseña), ve a la{' '}
          <Link
            href="/dashboard/users"
            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
          >
            gestión de usuarios
          </Link>
        </p>
      </motion.div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-lg"
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {confirmAction === 'delete'
                ? `¿Desactivar a ${getFullName(representative)}?`
                : `¿Activar a ${getFullName(representative)}?`}
            </h3>
            <p className="text-muted-foreground mb-6">
              {confirmAction === 'delete'
                ? 'El representante será marcado como inactivo y no podrá acceder al sistema.'
                : 'El representante será reactivado y podrá acceder al sistema nuevamente.'}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={confirmAction === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}
              >
                {confirmAction === 'delete' ? 'Desactivar' : 'Activar'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
