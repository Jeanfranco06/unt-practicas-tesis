'use client';

import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, GraduationCap, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardSkeleton } from '@/components/student/LoadingState';
import { useState } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

// Mock data
const mockProjects = [
  { id: 1, titulo: 'Sistema de Gestión Integral de Prácticas Preprofesionales', area: 'Ingeniería de Software', estado: 'EN_DESARROLLO', estudiante: 'Juan Pérez', fechaRegistro: '2024-08-15', avance: 45 },
  { id: 2, titulo: 'Aplicación de Machine Learning para Predicción de Notas', area: 'Inteligencia Artificial', estado: 'APROBADO', estudiante: 'María García', fechaRegistro: '2024-09-01', avance: 0 },
];

const estadoColors: Record<string, string> = {
  'EN_DESARROLLO': 'bg-blue-500/20 text-blue-400',
  'APROBADO': 'bg-emerald-500/20 text-emerald-400',
  'EN_REVISION': 'bg-amber-500/20 text-amber-400',
  'CULMINADO': 'bg-purple-500/20 text-purple-400',
};

export default function ThesisListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const isLoading = false;

  const filteredProjects = mockProjects.filter(p =>
    p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tesis</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión de proyectos de tesis</p>
        </div>
        <Button className="bg-purple-500 hover:bg-purple-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Proyecto
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Buscar proyectos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500"
        />
      </motion.div>

      {/* Projects Grid */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredProjects.map((project) => (
          <motion.div
            key={project.id}
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-100">{project.titulo}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <GraduationCap className="w-4 h-4" />
                    <span>{project.area}</span>
                    <span className="text-slate-600">•</span>
                    <span>{project.estudiante}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3">
                    <span className={`px-2 py-1 text-xs rounded ${estadoColors[project.estado] || 'bg-slate-800 text-slate-400'}`}>
                      {project.estado.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {project.fechaRegistro}
                    </span>
                  </div>
                </div>
              </div>
              {project.avance > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${project.avance}%` }}
                    />
                  </div>
                  <span className="text-sm text-slate-400">{project.avance}%</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No se encontraron proyectos</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
