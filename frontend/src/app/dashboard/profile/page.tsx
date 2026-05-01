'use client';

import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  GraduationCap,
  Briefcase,
  Building2,
  Calendar,
  Edit,
  Key,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/student/LoadingState';
import { useAuth } from '@/hooks/useAuth';
import { trpc } from '@/lib/trpc/react';
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

const roleConfig: Record<string, { label: string; color: string; icon: any }> = {
  Administrador: { label: 'Administrador', color: 'bg-red-500/20 text-red-600', icon: Shield },
  Coordinador: { label: 'Coordinador', color: 'bg-blue-500/20 text-blue-600', icon: Briefcase },
  Asesor: { label: 'Asesor', color: 'bg-purple-500/20 text-purple-600', icon: GraduationCap },
  Estudiante: { label: 'Estudiante', color: 'bg-emerald-500/20 text-emerald-600', icon: GraduationCap },
  RepresentanteEmpresa: { label: 'Representante', color: 'bg-amber-500/20 text-amber-600', icon: Building2 },
};

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
  });

  // Modal de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // @ts-ignore - TRPC types
  const { data: profile, isLoading, refetch } = (trpc as any).auth?.me?.useQuery() || { data: null, isLoading: false, refetch: () => {} };

  // @ts-ignore - TRPC types
  const { mutate: updateProfile, isPending: isUpdating } = (trpc as any).auth?.updateProfile?.useMutation({
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Perfil actualizado correctamente',
      });
      setIsEditing(false);
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    },
  });

  // @ts-ignore - TRPC types
  const { mutate: changePassword, isPending: isChangingPassword } = (trpc as any).auth?.changePassword?.useMutation({
    onSuccess: () => {
      toast({
        title: 'Éxito',
        description: 'Contraseña actualizada correctamente',
      });
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo cambiar la contraseña',
        variant: 'destructive',
      });
    },
  });

  // Inicializar formulario cuando se cargan los datos
  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellidoPaterno: profile.apellidoPaterno || '',
        apellidoMaterno: profile.apellidoMaterno || '',
      });
    }
  }, [profile]);

  const roleInfo = role ? roleConfig[role] : null;
  const RoleIcon = roleInfo?.icon || User;

  const handleSave = () => {
    const dataToUpdate: any = {};
    if (formData.nombre.trim()) dataToUpdate.nombre = formData.nombre.trim();
    if (formData.apellidoPaterno.trim()) dataToUpdate.apellidoPaterno = formData.apellidoPaterno.trim();
    if (formData.apellidoMaterno.trim()) dataToUpdate.apellidoMaterno = formData.apellidoMaterno.trim();

    if (Object.keys(dataToUpdate).length === 0) {
      toast({
        title: 'Sin cambios',
        description: 'No hay cambios para guardar',
      });
      return;
    }

    updateProfile(dataToUpdate);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas nuevas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona tu información personal
          </p>
        </div>
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
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl flex items-center justify-center">
              <RoleIcon className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">
                  {profile?.nombre} {profile?.apellidoPaterno} {profile?.apellidoMaterno}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  {roleInfo && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5 ${roleInfo.color}`}>
                      <RoleIcon className="w-4 h-4" />
                      {roleInfo.label}
                    </span>
                  )}
                  <span className="px-3 py-1 rounded-full text-sm bg-muted text-muted-foreground">
                    {profile?.email}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <p className="font-medium">{roleInfo?.label || role}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Miembro desde</p>
                  <p className="font-medium">
                    {profile?.creadoEn ? new Date(profile.creadoEn).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estado</p>
                  <p className="font-medium">
                    {profile?.activo ? (
                      <span className="text-emerald-600">Activo</span>
                    ) : (
                      <span className="text-red-600">Inactivo</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Form */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <h3 className="font-semibold mb-4">Editar Información</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nombre</label>
              <Input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder={profile?.nombre}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Apellido Paterno</label>
              <Input
                value={formData.apellidoPaterno}
                onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                placeholder={profile?.apellidoPaterno}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Apellido Materno</label>
              <Input
                value={formData.apellidoMaterno}
                onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                placeholder={profile?.apellidoMaterno}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Security Section */}
      <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Key className="w-5 h-5" />
          Seguridad
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="font-medium">Cambiar Contraseña</p>
              <p className="text-sm text-muted-foreground">Actualiza tu contraseña de acceso</p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
              Cambiar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Password Change Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Cambiar Contraseña
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Contraseña Actual</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Ingresa tu contraseña actual"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nueva Contraseña</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Confirmar Nueva Contraseña</label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="Repite la nueva contraseña"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {isChangingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
