'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, UserCog, Building2, Shield, Users, Info, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const userTypes = [
  {
    id: 'base',
    title: 'Usuario Base (sin rol)',
    description: 'Crear usuario sin rol asignado - Requiere perfil posterior para acceder',
    icon: User,
    color: 'bg-slate-500',
    features: [
      'Crear usuario base sin rol',
      'No puede acceder al sistema aún',
      'Vincular perfil después (Estudiante/Docente/etc)',
      'Ideal para migraciones o registros previos'
    ],
    href: '/dashboard/users/new/base'
  },
  {
    id: 'student',
    title: 'Estudiante',
    description: 'Vincular a usuario existente o crear nuevo con perfil automático',
    icon: GraduationCap,
    color: 'bg-amber-500',
    features: [
      'Opción 1: Vincular usuario existente sin perfil',
      'Opción 2: Crear usuario + estudiante juntos',
      'Código universitario automático',
      'Acceso inmediato al sistema'
    ],
    href: '/dashboard/users/new/student'
  },
  {
    id: 'teacher',
    title: 'Docente (Asesor/Coordinador)',
    description: 'Vincular a usuario existente o crear nuevo con roles específicos',
    icon: UserCog,
    color: 'bg-blue-500',
    features: [
      'Opción 1: Vincular usuario existente sin perfil',
      'Opción 2: Crear usuario + docente juntos',
      'Asignar carrera y especialidad',
      'Roles: ASESOR y/o COORDINADOR'
    ],
    href: '/dashboard/users/new/teacher'
  },
  {
    id: 'representative',
    title: 'Representante de Empresa',
    description: 'Vincular a usuario existente o crear nuevo para empresa',
    icon: Building2,
    color: 'bg-cyan-500',
    features: [
      'Opción 1: Vincular usuario existente sin perfil',
      'Opción 2: Crear usuario + representante juntos',
      'Vínculo directo con empresa',
      'Gestión de ofertas y convenios'
    ],
    href: '/dashboard/users/new/representative'
  },
  {
    id: 'admin',
    title: 'Administrador',
    description: 'Crear nuevo administrador con acceso total',
    icon: Shield,
    color: 'bg-purple-500',
    features: [
      'Solo creación de nuevo usuario',
      'Acceso completo al sistema',
      'Gestión de usuarios',
      'Sin perfil adicional'
    ],
    href: '/dashboard/users/new/admin'
  }
];

export default function SelectUserTypePage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="border-border">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crear Nuevo Usuario</h1>
          <p className="text-muted-foreground text-sm mt-1">Selecciona el tipo de usuario que deseas crear</p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div 
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Flujo Flexible de Gestión</p>
            <p>Ahora puedes vincular usuarios existentes a perfiles o crear nuevos usuarios con sus perfiles en un solo paso. Esto permite mayor flexibilidad en la gestión de usuarios y perfiles académicos/laborales.</p>
          </div>
        </div>
      </motion.div>

      {/* User Type Cards */}
      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6">
        {userTypes.map((type, index) => {
          const IconComponent = type.icon;
          return (
            <motion.div
              key={type.id}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="group"
            >
              <Link href={type.href}>
                <div className="p-6 bg-card rounded-xl border border-border hover:border-border/60 transition-all h-full">
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600 transition-colors">
                        {type.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-foreground mb-2">Características:</p>
                    <ul className="space-y-1">
                      {type.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <Button variant="outline" className="w-full group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                      <Users className="w-4 h-4 mr-2" />
                      Crear {type.title.split(' ')[0]}
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-foreground">Base</span>
          </div>
          <p className="text-xs text-muted-foreground">Sin rol - Sin acceso</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-medium text-foreground">Estudiantes</span>
          </div>
          <p className="text-xs text-muted-foreground">Perfil automático</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <UserCog className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-foreground">Docentes</span>
          </div>
          <p className="text-xs text-muted-foreground">Solo rol</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-cyan-500" />
            <span className="text-sm font-medium text-foreground">Representantes</span>
          </div>
          <p className="text-xs text-muted-foreground">Requiere empresa</p>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-purple-500" />
            <span className="text-sm font-medium text-foreground">Admins</span>
          </div>
          <p className="text-xs text-muted-foreground">Acceso total</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
