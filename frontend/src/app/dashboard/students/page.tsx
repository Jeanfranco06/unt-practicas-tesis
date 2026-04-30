'use client';

import { motion } from 'framer-motion';
import { Users, Search, GraduationCap, Mail, BookOpen } from 'lucide-react';
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
const mockStudents = [
  { id: 1, codigo: '2022010234', nombre: 'Juan', apellidoPaterno: 'Pérez', apellidoMaterno: 'Herrera', escuela: 'Ingeniería de Sistemas', promedio: 15.8, creditos: 145, email: 'estudiante@unt.edu.pe' },
  { id: 2, codigo: '2022010235', nombre: 'María', apellidoPaterno: 'García', apellidoMaterno: 'López', escuela: 'Ingeniería de Sistemas', promedio: 16.2, creditos: 160, email: 'maria.garcia@unt.edu.pe' },
];

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const isLoading = false;

  const filteredStudents = mockStudents.filter(s =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.apellidoPaterno.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.codigo.toLowerCase().includes(searchTerm.toLowerCase())
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-slate-100">Estudiantes</h1>
        <p className="text-slate-400 text-sm mt-1">Gestión de estudiantes registrados</p>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <Input
          type="search"
          placeholder="Buscar estudiantes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500"
        />
      </motion.div>

      {/* Students Grid */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredStudents.map((student) => (
          <motion.div
            key={student.id}
            whileHover={{ scale: 1.01 }}
            className="p-6 bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {student.nombre} {student.apellidoPaterno} {student.apellidoMaterno}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <BookOpen className="w-4 h-4" />
                    <span>{student.escuela}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded">Código: {student.codigo}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded">Promedio: {student.promedio}</span>
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">{student.creditos} créditos</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Mail className="w-4 h-4" />
                <span>{student.email}</span>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredStudents.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p>No se encontraron estudiantes</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}