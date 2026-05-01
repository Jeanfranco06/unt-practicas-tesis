'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  Briefcase,
  BookOpen,
  Search,
  GraduationCap,
  Mail,
  Phone,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/student/LoadingState';
import { trpc } from '@/lib/trpc/react';
import { useToast } from '@/components/ui/use-toast';

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

export default function AdvisorStudentsPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'internship' | 'thesis'>('all');

  // @ts-ignore - TRPC types
  const { data: internships, isLoading: loadingInternships } = (trpc as any).internships?.getMyAdvisedInternships?.useQuery() || { data: [], isLoading: false };
  // @ts-ignore - TRPC types
  const { data: thesis, isLoading: loadingThesis } = (trpc as any).thesis?.getMyAdvisedThesis?.useQuery() || { data: [], isLoading: false };

  const isLoading = loadingInternships || loadingThesis;

  // Combinar estudiantes de prácticas y tesis
  const students = new Map();

  // Agregar estudiantes de prácticas
  internships?.forEach((internship: any) => {
    if (internship.estudiante) {
      const studentId = internship.estudiante.id;
      if (!students.has(studentId)) {
        students.set(studentId, {
          ...internship.estudiante,
          practicas: [],
          tesis: [],
        });
      }
      students.get(studentId).practicas.push(internship);
    }
  });

  // Agregar estudiantes de tesis
  thesis?.forEach((t: any) => {
    if (t.estudiante) {
      const studentId = t.estudiante.id;
      if (!students.has(studentId)) {
        students.set(studentId, {
          ...t.estudiante,
          practicas: [],
          tesis: [],
        });
      }
      students.get(studentId).tesis.push(t);
    }
  });

  const studentsList = Array.from(students.values());

  // Filtrar estudiantes
  const filteredStudents = studentsList.filter((student: any) => {
    const matchesSearch =
      student.usuario?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usuario?.apellidoPaterno?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usuario?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.codigoUniversitario?.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'internship') return matchesSearch && student.practicas.length > 0;
    if (activeTab === 'thesis') return matchesSearch && student.tesis.length > 0;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mis Estudiantes</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Estudiantes asignados en prácticas y tesis
            </p>
          </div>
        </div>
        <LoadingState rows={5} />
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
          <h1 className="text-2xl font-bold text-foreground">Mis Estudiantes</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Estudiantes asignados en prácticas y tesis
          </p>
        </div>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-2 rounded-lg">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">{studentsList.length} estudiantes</span>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por nombre, código o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'Todos', icon: Users },
            { id: 'internship', label: 'Prácticas', icon: Briefcase },
            { id: 'thesis', label: 'Tesis', icon: BookOpen },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Students List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student: any) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Student Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {student.usuario?.nombre} {student.usuario?.apellidoPaterno} {student.usuario?.apellidoMaterno}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5" />
                          {student.usuario?.email}
                        </span>
                        <span className="px-2 py-0.5 bg-muted rounded text-xs">
                          {student.codigoUniversitario}
                        </span>
                        <span className="px-2 py-0.5 bg-muted rounded text-xs">
                          {student.escuelaProfesional}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities Summary */}
                <div className="flex flex-wrap gap-4 lg:border-l lg:pl-6">
                  {/* Prácticas */}
                  {student.practicas.length > 0 && (
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Prácticas ({student.practicas.length})</span>
                      </div>
                      <div className="space-y-1">
                        {student.practicas.slice(0, 2).map((p: any) => (
                          <div key={p.id} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${
                              p.estado === 'activa' ? 'bg-emerald-500' :
                              p.estado === 'en_evaluacion' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`} />
                            <span className="text-muted-foreground truncate max-w-[150px]">
                              {p.empresa?.razonSocial || 'Empresa no especificada'}
                            </span>
                          </div>
                        ))}
                        {student.practicas.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{student.practicas.length - 2} más</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tesis */}
                  {student.tesis.length > 0 && (
                    <div className="min-w-[200px]">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium">Tesis ({student.tesis.length})</span>
                      </div>
                      <div className="space-y-1">
                        {student.tesis.slice(0, 2).map((t: any) => (
                          <div key={t.id} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${
                              t.estado === 'en_desarrollo' ? 'bg-emerald-500' :
                              t.estado === 'en_revision' ? 'bg-amber-500' :
                              'bg-blue-500'
                            }`} />
                            <span className="text-muted-foreground truncate max-w-[150px]">
                              {t.titulo}
                            </span>
                          </div>
                        ))}
                        {student.tesis.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{student.tesis.length - 2} más</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 lg:border-l lg:pl-6">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/students/${student.id}`}>
                      Ver detalle
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                  {student.practicas.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-primary" asChild>
                      <Link href={`/dashboard/internships/${student.practicas[0].id}`}>
                        <Briefcase className="w-4 h-4 mr-1" />
                        Ver práctica
                      </Link>
                    </Button>
                  )}
                  {student.tesis.length > 0 && (
                    <Button variant="ghost" size="sm" className="text-purple-500" asChild>
                      <Link href={`/dashboard/thesis/${student.tesis[0].id}`}>
                        <BookOpen className="w-4 h-4 mr-1" />
                        Ver tesis
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No hay estudiantes asignados</p>
            <p className="text-sm mt-2">Aún no tienes estudiantes asignados en prácticas o tesis.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
