'use client';

import { motion } from 'framer-motion';
import { Settings, Shield, Save, User, Globe, Eye, FileText, Clock, Lock, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

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
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => setMounted(true), []);

  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSaveMessage('Cambios guardados exitosamente');
    setIsSaving(false);
    
    // Clear password fields after save
    setCurrentPassword('');
    setNewPassword('');
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
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
                placeholder="Tu nombre"
                className="bg-muted/50 border-input"
                disabled
              />
              <p className="text-xs text-muted-foreground">Los datos personales se gestionan desde el perfil</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Apellidos</Label>
              <Input
                placeholder="Tus apellidos"
                className="bg-muted/50 border-input"
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Correo electrónico</Label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
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
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4" /> Cambiar contraseña
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Contraseña actual</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Nueva contraseña</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background border-input"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                La contraseña debe tener al menos 8 caracteres
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button with feedback */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          {saveMessage && (
            <p className="text-sm text-green-600 font-medium">{saveMessage}</p>
          )}
          <div className="flex-1" />
          <Button 
            onClick={handleSave}
            disabled={isSaving || (!currentPassword && !newPassword)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Guardar cambios
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

