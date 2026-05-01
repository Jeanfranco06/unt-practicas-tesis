'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Users, Plus, Search, Edit, Trash2, UserCheck, UserX, Shield, MoreHorizontal, AlertCircle, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import { 
  getUsers, 
  deleteUser, 
  toggleUserStatus, 
  filterUsers, 
  getFullName, 
  getInitials, 
  getAvatarColor, 
  rolColors, 
  rolLabels, 
  getStatusBadgeColor,
  rolSelectOptions,
  statusOptions,
  API_URL,
  fetchWithAuth,
  type User
} from './_lib/users';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface ConfirmAction {
  type: 'delete' | 'toggle' | null;
  userId: number | null;
  userName: string;
  title: string;
  description: string;
  isActivating?: boolean;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({
    type: null,
    userId: null,
    userName: '',
    title: '',
    description: '',
  });

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const showDeleteConfirm = (user: User) => {
    setConfirmAction({
      type: 'delete',
      userId: user.id,
      userName: getFullName(user),
      title: 'Eliminar usuario',
      description: `¿Estás seguro de eliminar a "${getFullName(user)}"? Esta acción no se puede deshacer.`,
    });
  };

  const showToggleConfirm = (user: User) => {
    const isActivating = !user.activo;
    setConfirmAction({
      type: 'toggle',
      userId: user.id,
      userName: getFullName(user),
      title: isActivating ? 'Activar usuario' : 'Desactivar usuario',
      description: isActivating 
        ? `¿Deseas activar a "${getFullName(user)}"? Podrá acceder al sistema.`
        : `¿Deseas desactivar a "${getFullName(user)}"? No podrá acceder al sistema.`,
      isActivating,
    });
  };

  const handleDelete = async () => {
    if (!confirmAction.userId) return;
    const id = confirmAction.userId;
    setConfirmAction({ type: null, userId: null, userName: '', title: '', description: '' });

    try {
      await deleteUser(id);
      toast({ title: 'Éxito', description: 'Usuario eliminado exitosamente.' });
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleToggle = async () => {
    if (!confirmAction.userId) return;
    const id = confirmAction.userId;
    const activo = confirmAction.isActivating ?? false;
    setConfirmAction({ type: null, userId: null, userName: '', title: '', description: '' });

    try {
      await toggleUserStatus(id, activo);
      toast({ 
        title: 'Éxito', 
        description: activo ? 'Usuario activado exitosamente.' : 'Usuario desactivado exitosamente.'
      });
      loadUsers();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleConfirmAction = () => {
    if (confirmAction.type === 'delete') {
      handleDelete();
    } else if (confirmAction.type === 'toggle') {
      handleToggle();
    }
  };

  const filteredUsers = filterUsers(users, searchTerm, roleFilter, statusFilter);

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
        <p>Error al cargar usuarios: {error}</p>
        <Button onClick={loadUsers} className="mt-4 bg-red-500 hover:bg-red-600 text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión de usuarios y roles del sistema</p>
        </div>
        <Button asChild className="bg-blue-500 hover:bg-blue-600 text-white">
          <Link href="/dashboard/users/new">
            <Plus className="h-4 w-4 mr-2" /> Nuevo Usuario
          </Link>
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 text-muted-foreground text-sm mr-1">
            <Filter className="w-4 h-4" />
            <span>Filtros:</span>
          </div>
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
          >
            <option value="todos">Todos los roles</option>
            {rolSelectOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-md border border-border bg-background text-sm text-foreground"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {(searchTerm || roleFilter !== 'todos' || statusFilter !== 'todos') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('todos');
                setStatusFilter('todos');
              }}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
              Limpiar
            </button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total usuarios</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.activo).length}</p>
          <p className="text-sm text-muted-foreground">Activos</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-2xl font-bold text-red-600">{users.filter(u => !u.activo).length}</p>
          <p className="text-sm text-muted-foreground">Inactivos</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
          <p className="text-sm text-muted-foreground">Filtrados</p>
        </div>
      </motion.div>

      {/* Users List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        <AnimatePresence>
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              whileHover={{ scale: 1.01 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full ${getAvatarColor(user)} flex items-center justify-center text-white font-semibold`}>
                    {getInitials(user)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{getFullName(user)}</h3>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${rolColors[user.rol]}`}>
                        {rolLabels[user.rol]}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadgeColor(user.activo)}`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Registrado: {new Date(user.creadoEn || '').toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted"
                  >
                    <Link href={`/dashboard/users/${user.id}/edit`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showToggleConfirm(user)}
                    className={user.activo 
                      ? 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10' 
                      : 'border-green-500/30 text-green-600 hover:bg-green-500/10'
                    }
                  >
                    {user.activo ? (
                      <><UserX className="w-4 h-4 mr-1" /> Desactivar</>
                    ) : (
                      <><UserCheck className="w-4 h-4 mr-1" /> Activar</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showDeleteConfirm(user)}
                    className="border-red-500/30 text-red-600 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-12 text-center bg-card rounded-xl border border-border"
          >
            <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron usuarios</h3>
            <p className="text-muted-foreground">
              {searchTerm || roleFilter !== 'todos' || statusFilter !== 'todos'
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza creando un nuevo usuario'}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Confirmation Modal */}
      {confirmAction.type && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card rounded-xl border border-border p-6 max-w-md w-full shadow-lg"
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className={`w-6 h-6 ${confirmAction.type === 'delete' ? 'text-red-500' : 'text-amber-500'}`} />
              <h3 className="text-lg font-semibold text-foreground">{confirmAction.title}</h3>
            </div>
            <p className="text-muted-foreground mb-6">{confirmAction.description}</p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setConfirmAction({ type: null, userId: null, userName: '', title: '', description: '' })}
                className="border-border"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmAction}
                className={confirmAction.type === 'delete' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}
              >
                Confirmar
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
