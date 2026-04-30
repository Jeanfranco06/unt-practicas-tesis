'use client';

import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Database, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-100">Configuración</h1>
        <p className="text-slate-400 text-sm mt-1">Gestiona las preferencias del sistema</p>
      </motion.div>

      {/* Settings Sections */}
      <div className="grid gap-6">
        {/* General Settings */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-slate-900 rounded-xl border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">General</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">Modo oscuro</Label>
                <p className="text-sm text-slate-500">Usar tema oscuro por defecto</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-slate-900 rounded-xl border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Notificaciones</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-slate-200">Notificaciones por email</Label>
                <p className="text-sm text-slate-500">Recibir actualizaciones por correo</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div
          variants={itemVariants}
          className="p-6 bg-slate-900 rounded-xl border border-slate-800"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-slate-100">Seguridad</h2>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-slate-200">Contraseña actual</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-slate-200">Nueva contraseña</Label>
              <Input
                type="password"
                placeholder="••••••••"
                className="bg-slate-800 border-slate-700 text-slate-200"
              />
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div variants={itemVariants} className="flex justify-end">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Save className="h-4 w-4 mr-2" /> Guardar cambios
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
