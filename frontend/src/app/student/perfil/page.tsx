'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  Edit2,
  CheckCircle2,
  Shield,
  Bell,
  Moon,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/student/StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

// Mock data
const perfilData = {
  nombres: 'Juan Carlos',
  apellidos: 'Pérez García',
  email: 'juan.perez@unt.edu.pe',
  telefono: '+51 987 654 321',
  direccion: 'Av. Universitaria 123, Trujillo',
  codigo: '20210123A',
  facultad: 'Ingeniería',
  escuela: 'Ingeniería de Sistemas',
  ciclo: '9no',
  fechaNacimiento: '2000-05-15',
  dni: '12345678',
  estado: 'active',
  fechaIngreso: '2021-03-15',
};

const estadisticas = [
  { label: 'Prácticas', value: '2', icon: Briefcase, color: 'bg-blue-500' },
  { label: 'Tesis', value: '1', icon: BookOpen, color: 'bg-purple-500' },
  { label: 'Ciclo actual', value: '9no', icon: GraduationCap, color: 'bg-emerald-500' },
  { label: 'Promedio', value: '16.8', icon: CheckCircle2, color: 'bg-amber-500' },
];

export default function PerfilPage() {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(perfilData);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-900">Mi Perfil</h1>
        <p className="text-slate-500 mt-1">
          Gestiona tu información personal y configuración
        </p>
      </motion.div>

      {/* Profile Header Card */}
      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500" />
          <div className="px-6 pb-6">
            <div className="relative flex flex-col sm:flex-row sm:items-end -mt-12 mb-4 gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-2xl shadow-lg flex items-center justify-center border-4 border-white">
                  <span className="text-3xl font-bold text-slate-700">
                    {perfilData.nombres[0]}{perfilData.apellidos[0]}
                  </span>
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-slate-800 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              {/* Info */}
              <div className="flex-1 mb-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-slate-900">
                    {perfilData.nombres} {perfilData.apellidos}
                  </h2>
                  <StatusBadge variant="active" size="sm" pulse>
                    Estudiante activo
                  </StatusBadge>
                </div>
                <p className="text-slate-500 text-sm">
                  {perfilData.escuela} • {perfilData.facultad}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant={editMode ? 'default' : 'outline'}
                  onClick={() => setEditMode(!editMode)}
                  className={editMode ? 'bg-primary-600' : ''}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  {editMode ? 'Guardar cambios' : 'Editar perfil'}
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              {estadisticas.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="bg-white border border-slate-200">
            <TabsTrigger value="general">Información general</TabsTrigger>
            <TabsTrigger value="academico">Información académica</TabsTrigger>
            <TabsTrigger value="seguridad">Seguridad</TabsTrigger>
            <TabsTrigger value="preferencias">Preferencias</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Datos personales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombres">Nombres</Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    disabled={!editMode}
                    className={!editMode ? 'bg-slate-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellidos">Apellidos</Label>
                  <Input
                    id="apellidos"
                    value={formData.apellidos}
                    disabled={!editMode}
                    className={!editMode ? 'bg-slate-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo institucional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled={!editMode}
                      className={`pl-10 ${!editMode ? 'bg-slate-50' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      disabled={!editMode}
                      className={`pl-10 ${!editMode ? 'bg-slate-50' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      disabled={!editMode}
                      className={`pl-10 ${!editMode ? 'bg-slate-50' : ''}`}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dni">DNI</Label>
                  <Input
                    id="dni"
                    value={formData.dni}
                    disabled={!editMode}
                    className={!editMode ? 'bg-slate-50' : ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de nacimiento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="fechaNacimiento"
                      type="date"
                      value={formData.fechaNacimiento}
                      disabled={!editMode}
                      className={`pl-10 ${!editMode ? 'bg-slate-50' : ''}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="academico" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Información académica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de estudiante</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="codigo"
                      value={formData.codigo}
                      disabled
                      className="pl-10 bg-slate-50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultad">Facultad</Label>
                  <Input
                    id="facultad"
                    value={formData.facultad}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="escuela">Escuela profesional</Label>
                  <Input
                    id="escuela"
                    value={formData.escuela}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciclo">Ciclo actual</Label>
                  <Input
                    id="ciclo"
                    value={formData.ciclo}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaIngreso">Fecha de ingreso</Label>
                  <Input
                    id="fechaIngreso"
                    value={new Date(formData.fechaIngreso).toLocaleDateString('es-ES')}
                    disabled
                    className="bg-slate-50"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seguridad" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-600" />
                Seguridad de la cuenta
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">Contraseña</p>
                    <p className="text-sm text-slate-500">
                      Última actualización: hace 3 meses
                    </p>
                  </div>
                  <Button variant="outline">Cambiar</Button>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">
                      Autenticación de dos factores
                    </p>
                    <p className="text-sm text-slate-500">
                      Protege tu cuenta con 2FA
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-medium text-slate-900">
                      Sesiones activas
                    </p>
                    <p className="text-sm text-slate-500">
                      1 dispositivo conectado
                    </p>
                  </div>
                  <Button variant="outline" className="text-red-600 hover:text-red-700">
                    Cerrar todas
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferencias" className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">
                Preferencias del sistema
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">
                        Notificaciones por email
                      </p>
                      <p className="text-sm text-slate-500">
                        Recibe actualizaciones en tu correo
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Moon className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Modo oscuro</p>
                      <p className="text-sm text-slate-500">
                        Cambiar la apariencia del sistema
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="font-medium text-slate-900">Idioma</p>
                      <p className="text-sm text-slate-500">
                        Español (Latinoamérica)
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Cambiar
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
