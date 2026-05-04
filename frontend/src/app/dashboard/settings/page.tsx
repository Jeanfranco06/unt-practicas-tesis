'use client';

import { motion } from 'framer-motion';
import { Settings, Shield, Save, User, Globe, FileText, Clock, Lock, Moon, Sun, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc/react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // @ts-ignore - TRPC types
  const { data: profile, isLoading: loadingProfile } = (trpc as any).auth?.me?.useQuery() || { data: null, isLoading: false };

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

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        <div className="grid gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestiona las preferencias del sistema</p>
      </motion.div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* General Settings - Tema */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-card rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Apariencia</h2>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-muted rounded-lg">
                {isDark ? <Moon className="w-5 h-5 text-foreground" /> : <Sun className="w-5 h-5 text-foreground" />}
              </div>
              <div>
                <Label className="text-foreground">Tema</Label>
                <p className="text-sm text-muted-foreground">
                  {isDark ? 'Modo oscuro activado' : 'Modo claro activado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isDark ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
                className="gap-2"
              >
                <Moon className="w-4 h-4" /> Oscuro
              </Button>
              <Button
                variant={!isDark ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
                className="gap-2"
              >
                <Sun className="w-4 h-4" /> Claro
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Perfil de Usuario - Solo visualización */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-card rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <User className="w-5 h-5 text-indigo-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Información Personal</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Nombre</Label>
              <Input
                value={profile?.nombre || ''}
                className="bg-muted/50 border-input"
                disabled
              />
              <p className="text-xs text-muted-foreground">Los datos personales se gestionan desde el perfil</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Apellidos</Label>
              <Input
                value={`${profile?.apellidoPaterno || ''} ${profile?.apellidoMaterno || ''}`}
                className="bg-muted/50 border-input"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Correo electrónico</Label>
              <Input
                type="email"
                value={profile?.email || ''}
                className="bg-muted/50 border-input"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Teléfono</Label>
              <Input
                type="tel"
                placeholder="+51 999 999 999"
                className="bg-muted/50 border-input"
                disabled
              />
            </div>
          </div>
        </motion.div>


        {/* Seguridad - Solo cambio de contraseña funcional */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-card rounded-xl border border-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Cambiar contraseña
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Actualiza tu contraseña de acceso
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowPasswordModal(true)}>
                Cambiar
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

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

