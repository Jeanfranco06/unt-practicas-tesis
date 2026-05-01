'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Search,
  UserCircle,
  Calendar,
  FileText,
  MessageSquare,
  ChevronRight,
  Clock,
  MoreVertical,
  History,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/student/StatusBadge';
import { EmptyState } from '@/components/student/EmptyState';
import { CardSkeleton } from '@/components/student/LoadingState';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/react';

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
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

// Mock data
const tesisData = {
  actual: {
    id: 1,
    titulo: 'Sistema de Gestión de Prácticas Preprofesionales para la UNT',
    tema: 'Ingeniería de Software',
    estado: 'draft',
    asesor: 'Dr. Juan Carlos Ramírez',
    coAsesor: 'Dra. María Elena Torres',
    fechaInicio: '2024-01-15',
    fechaEntrega: '2024-12-15',
    progreso: 45,
    revisiones: 3,
    palabrasClave: ['gestión', 'prácticas', 'software', 'educación'],
    resumen:
      'Este trabajo propone el desarrollo de un sistema integral para la gestión de prácticas preprofesionales...',
  },
  historial: [
    {
      id: 1,
      version: 'v0.3',
      fecha: '2024-10-15',
      estado: 'reviewed',
      comentarios: 12,
      cambios: 'Metodología actualizada y casos de estudio añadidos',
    },
    {
      id: 2,
      version: 'v0.2',
      fecha: '2024-09-01',
      estado: 'reviewed',
      comentarios: 8,
      cambios: 'Correcciones en el marco teórico',
    },
    {
      id: 3,
      version: 'v0.1',
      fecha: '2024-07-20',
      estado: 'approved',
      comentarios: 0,
      cambios: 'Versión inicial aprobada',
    },
  ],
  actividades: [
    {
      id: 1,
      tipo: 'revision',
      titulo: 'Revisión de capítulo 3 completada',
      fecha: 'Hace 2 días',
      autor: 'Dr. Juan Carlos Ramírez',
    },
    {
      id: 2,
      tipo: 'comentario',
      titulo: 'Nuevo comentario en sección 2.4',
      fecha: 'Hace 3 días',
      autor: 'Dra. María Elena Torres',
    },
    {
      id: 3,
      tipo: 'documento',
      titulo: 'Documento v0.3 subido',
      fecha: 'Hace 5 días',
      autor: 'Tú',
    },
  ],
};

export default function TesisPage() {
  const [busqueda, setBusqueda] = useState('');
  const [isLoading] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Tesis</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tu trabajo de investigación
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/student/tesis/nueva-version">
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Nueva versión
            </Button>
          </Link>
          <Link href="/student/tesis/editar">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Editar tesis
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Main Tesis Card */}
      <motion.div variants={itemVariants}>
        <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                    {tesisData.actual.tema}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  {tesisData.actual.titulo}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Asesor: {tesisData.actual.asesor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Co-asesor: {tesisData.actual.coAsesor}
                    </span>
                  </div>
                </div>
              </div>
              <StatusBadge variant={tesisData.actual.estado as any} size="lg" pulse>
                {tesisData.actual.estado === 'draft' ? 'Borrador' : 'En revisión'}
              </StatusBadge>
            </div>
          </div>

          {/* Progress */}
          <div className="px-6 py-4 bg-muted/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Progreso general
              </span>
              <span className="text-sm font-semibold text-foreground">
                {tesisData.actual.progreso}%
              </span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tesisData.actual.progreso}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-border">
            {[
              {
                label: 'Fecha inicio',
                value: new Date(tesisData.actual.fechaInicio).toLocaleDateString('es-ES'),
                icon: Calendar,
              },
              {
                label: 'Fecha entrega',
                value: new Date(tesisData.actual.fechaEntrega).toLocaleDateString('es-ES'),
                icon: Clock,
              },
              {
                label: 'Revisiones',
                value: `${tesisData.actual.revisiones} realizadas`,
                icon: History,
              },
              {
                label: 'Días restantes',
                value: '45 días',
                icon: AlertCircle,
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="p-4 flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-semibold text-foreground">{stat.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Tabs Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="actividad" className="space-y-4">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="actividad">Actividad reciente</TabsTrigger>
            <TabsTrigger value="historial">Historial de versiones</TabsTrigger>
            <TabsTrigger value="comentarios">Comentarios</TabsTrigger>
          </TabsList>

          <TabsContent value="actividad" className="space-y-4">
            {tesisData.actividades.map((actividad, index) => (
              <motion.div
                key={actividad.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:shadow-soft transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    actividad.tipo === 'revision'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20'
                      : actividad.tipo === 'comentario'
                      ? 'bg-blue-100 dark:bg-blue-500/20'
                      : 'bg-purple-100 dark:bg-purple-500/20'
                  }`}
                >
                  {actividad.tipo === 'revision' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : actividad.tipo === 'comentario' ? (
                    <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{actividad.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {actividad.autor} • {actividad.fecha}
                  </p>
                </div>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            {tesisData.historial.map((version, index) => (
              <motion.div
                key={version.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-muted-foreground">
                    {version.version}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">
                      Versión {version.version}
                    </p>
                    <StatusBadge
                      variant={version.estado as any}
                      size="sm"
                    >
                      {version.estado === 'reviewed' ? 'Revisado' : 'Aprobado'}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(version.fecha).toLocaleDateString('es-ES')} •{' '}
                    {version.comentarios} comentarios
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{version.cambios}</p>
                </div>
                <Button variant="ghost" size="sm">
                  <FileText className="w-4 h-4 mr-1" />
                  Ver
                </Button>
              </motion.div>
            ))}
          </TabsContent>

          <TabsContent value="comentarios">
            <div className="p-8 bg-card rounded-xl border border-border text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">No hay comentarios sin resolver</p>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Keywords & Summary */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-3">Resumen</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {tesisData.actual.resumen}
          </p>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border shadow-soft">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            Palabras clave
          </h3>
          <div className="flex flex-wrap gap-2">
            {tesisData.actual.palabrasClave.map((palabra) => (
              <span
                key={palabra}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {palabra}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

