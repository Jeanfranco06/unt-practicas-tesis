'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  Clock,
  ChevronRight,
  FileText,
  MoreVertical,
  Download,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/student/StatusBadge';
import { EmptyState } from '@/components/student/EmptyState';
import { CardSkeleton } from '@/components/student/LoadingState';
import Link from 'next/link';

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
const practicas = [
  {
    id: 1,
    empresa: 'Tech Solutions Perú S.A.C.',
    cargo: 'Desarrollador Frontend',
    fechaInicio: '2024-03-01',
    fechaFin: '2024-08-31',
    estado: 'active',
    horas: 240,
    horasTotales: 320,
    supervisor: 'Ing. Carlos Mendoza',
    progreso: 75,
    documentos: 5,
    documentosTotales: 8,
  },
  {
    id: 2,
    empresa: 'Innovación Digital EIRL',
    cargo: 'Pasante de Sistemas',
    fechaInicio: '2023-08-01',
    fechaFin: '2024-02-28',
    estado: 'completed',
    horas: 320,
    horasTotales: 320,
    supervisor: 'Ing. María López',
    progreso: 100,
    documentos: 8,
    documentosTotales: 8,
  },
];

const filtros = ['Todas', 'Activas', 'Completadas', 'Pendientes'];

export default function PracticasPage() {
  const [filtroActivo, setFiltroActivo] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [isLoading] = useState(false);

  const practicasFiltradas = practicas.filter((p) => {
    const matchesBusqueda = p.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.cargo.toLowerCase().includes(busqueda.toLowerCase());
    const matchesFiltro = filtroActivo === 'Todas' ||
      (filtroActivo === 'Activas' && p.estado === 'active') ||
      (filtroActivo === 'Completadas' && p.estado === 'completed') ||
      (filtroActivo === 'Pendientes' && p.estado === 'pending');
    return matchesBusqueda && matchesFiltro;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <h1 className="text-2xl font-bold text-slate-900">Mis Prácticas</h1>
          <p className="text-slate-500 mt-1">
            Gestiona tus prácticas preprofesionales
          </p>
        </div>
        <Link href="/student/practicas/nueva">
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva solicitud
          </Button>
        </Link>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {[
          { label: 'Práctica actual', value: 'Tech Solutions', status: 'active' as const },
          { label: 'Horas acumuladas', value: '560h', status: 'completed' as const },
          { label: 'Prácticas completadas', value: '1', status: 'completed' as const },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-semibold text-slate-900">{stat.value}</p>
              <StatusBadge variant={stat.status} size="sm">
                {stat.status === 'active' ? 'En curso' : 'Completado'}
              </StatusBadge>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Filters & Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="search"
            placeholder="Buscar prácticas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {filtros.map((filtro) => (
            <Button
              key={filtro}
              variant={filtroActivo === filtro ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFiltroActivo(filtro)}
              className={filtroActivo === filtro ? 'bg-primary-600' : ''}
            >
              {filtro}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Prácticas Grid */}
      {practicasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AnimatePresence>
            {practicasFiltradas.map((practica, index) => (
              <motion.div
                key={practica.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{practica.empresa}</h3>
                        <p className="text-sm text-slate-500">{practica.cargo}</p>
                      </div>
                    </div>
                    <StatusBadge
                      variant={practica.estado as any}
                      pulse={practica.estado === 'active'}
                    >
                      {practica.estado === 'active' ? 'Activo' : 'Completado'}
                    </StatusBadge>
                  </div>
                </div>

                {/* Progress */}
                <div className="px-6 py-4 bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Progreso
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {practica.progreso}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${practica.progreso}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className={`h-full rounded-full ${
                        practica.progreso === 100
                          ? 'bg-emerald-500'
                          : 'bg-gradient-to-r from-primary-500 to-purple-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {new Date(practica.fechaInicio).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}
                      {' - '}
                      {new Date(practica.fechaFin).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>
                      {practica.horas}/{practica.horasTotales}h
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>
                      {practica.documentos}/{practica.documentosTotales} docs
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>{practica.supervisor}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  <Link href={`/student/practicas/${practica.id}`}>
                    <Button variant="ghost" size="sm" className="text-primary-600">
                      Ver detalles
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit className="w-4 h-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Download className="w-4 h-4 text-slate-400" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No hay prácticas"
          description="Aún no has registrado ninguna práctica preprofesional."
          action={{
            label: 'Iniciar solicitud',
            onClick: () => {},
          }}
        />
      )}
    </motion.div>
  );
}
