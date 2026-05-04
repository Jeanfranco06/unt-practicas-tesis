'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Search,
  ArrowLeft,
  Briefcase,
  BookOpen,
  Users,
  Crown,
  FileText,
  Mic,
  Mail,
  GraduationCap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Advisor {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  especialidad?: string;
  facultad?: string;
  docenteId?: number;
}

interface WorkloadItem {
  id: number;
  tipo: 'practica' | 'tesis_asesor' | 'tesis_jurado';
  titulo?: string;
  estudiante?: string;
  rol?: string;
  estado: string;
}

interface TeacherWithWorkload extends Advisor {
  practicasAsesoradas: number;
  tesisAsesoradas: number;
  tesisJurado: number;
  totalCarga: number;
  cargaPorcentaje: number;
  detalle: WorkloadItem[];
}

interface TeachersViewProps {
  advisors: Advisor[];
  internships: any[];
  thesisProjects: any[];
  onBack: () => void;
}

export function TeachersView({ advisors, internships, thesisProjects, onBack }: TeachersViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithWorkload | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'load'>('load');

  // Calcular carga de trabajo para cada docente
  const teachersWithWorkload = useMemo(() => {
    const maxExpectedLoad = 10; // Carga máxima esperada para cálculo de porcentaje

    return advisors.map((advisor) => {
      // Prácticas asesoradas
      const practicasAsesoradas = internships.filter(
        (i) => Number(i.asesorAcademico?.id) === Number(advisor.id)
      );

      // Tesis como asesor
      const tesisAsesoradas = thesisProjects.filter((t) =>
        t.asignaciones?.some((a: any) => a.tipo === 'asesor' && Number(a.docente.id) === Number(advisor.docenteId))
      );

      // Tesis como jurado
      const tesisJurado = thesisProjects.filter((t) =>
        t.asignaciones?.some((a: any) => a.tipo === 'jurado' && Number(a.docente.id) === Number(advisor.docenteId))
      );

      // Construir detalle
      const detalle: WorkloadItem[] = [
        ...practicasAsesoradas.map((p) => ({
          id: p.id,
          tipo: 'practica' as const,
          titulo: `Práctica en ${p.empresa?.razonSocial || p.nombreEmpresaExterna || 'Empresa'}`,
          estudiante: `${p.estudiante?.usuario?.nombre} ${p.estudiante?.usuario?.apellidoPaterno}`,
          estado: p.estado,
        })),
        ...tesisAsesoradas.map((t) => ({
          id: t.id,
          tipo: 'tesis_asesor' as const,
          titulo: t.titulo,
          estudiante: `${t.estudiante?.usuario?.nombre} ${t.estudiante?.usuario?.apellidoPaterno}`,
          estado: t.estado,
        })),
        ...tesisJurado.map((t) => {
          const juradoAssignment = t.asignaciones?.find(
            (a: any) => a.tipo === 'jurado' && Number(a.docente.id) === Number(advisor.docenteId)
          );
          return {
            id: t.id,
            tipo: 'tesis_jurado' as const,
            titulo: t.titulo,
            estudiante: `${t.estudiante?.usuario?.nombre} ${t.estudiante?.usuario?.apellidoPaterno}`,
            rol: juradoAssignment?.rolEspecifico,
            estado: t.estado,
          };
        }),
      ];

      const totalCarga = practicasAsesoradas.length + tesisAsesoradas.length + tesisJurado.length;
      const cargaPorcentaje = Math.min((totalCarga / maxExpectedLoad) * 100, 100);

      return {
        ...advisor,
        practicasAsesoradas: practicasAsesoradas.length,
        tesisAsesoradas: tesisAsesoradas.length,
        tesisJurado: tesisJurado.length,
        totalCarga,
        cargaPorcentaje,
        detalle,
      };
    });
  }, [advisors, internships, thesisProjects]);

  // Filtrar y ordenar
  const filteredTeachers = useMemo(() => {
    let filtered = teachersWithWorkload;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          `${t.nombre} ${t.apellidoPaterno}`.toLowerCase().includes(term) ||
          t.email.toLowerCase().includes(term) ||
          t.especialidad?.toLowerCase().includes(term) ||
          t.facultad?.toLowerCase().includes(term)
      );
    }

    // Ordenar
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'load') {
        return b.totalCarga - a.totalCarga;
      }
      return `${a.apellidoPaterno} ${a.nombre}`.localeCompare(`${b.apellidoPaterno} ${b.nombre}`);
    });

    return filtered;
  }, [teachersWithWorkload, searchTerm, sortBy]);

  // Estadísticas generales
  const stats = useMemo(() => {
    const withLoad = teachersWithWorkload.filter((t) => t.totalCarga > 0);
    const avgLoad = withLoad.length > 0
      ? withLoad.reduce((sum, t) => sum + t.totalCarga, 0) / withLoad.length
      : 0;
    const overloaded = teachersWithWorkload.filter((t) => t.totalCarga > 8).length;
    const available = teachersWithWorkload.filter((t) => t.totalCarga < 5).length;

    return { avgLoad: avgLoad.toFixed(1), overloaded, available, total: teachersWithWorkload.length };
  }, [teachersWithWorkload]);

  const getCargaColor = (porcentaje: number, total: number) => {
    if (total === 0) return 'bg-muted';
    if (porcentaje >= 80) return 'bg-destructive';
    if (porcentaje >= 60) return 'bg-warning';
    if (porcentaje >= 40) return 'bg-info';
    return 'bg-primary';
  };

  const getCargaLabel = (porcentaje: number, total: number) => {
    if (total === 0) return 'Sin carga';
    if (porcentaje >= 80) return 'Sobrecargado';
    if (porcentaje >= 60) return 'Alta carga';
    if (porcentaje >= 40) return 'Carga media';
    return 'Disponible';
  };

  // Vista de detalle
  if (selectedTeacher) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedTeacher(null)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Detalle de Carga Docente</h2>
            <p className="text-sm text-muted-foreground">Vista completa de asignaciones</p>
          </div>
        </div>

        {/* Info del docente */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {selectedTeacher.nombre} {selectedTeacher.apellidoPaterno} {selectedTeacher.apellidoMaterno}
              </h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {selectedTeacher.email}
              </p>
              {(selectedTeacher.especialidad || selectedTeacher.facultad) && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedTeacher.especialidad && <span className="mr-2">{selectedTeacher.especialidad}</span>}
                  {selectedTeacher.facultad && <span>• {selectedTeacher.facultad}</span>}
                </p>
              )}
              <div className="flex gap-4 mt-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedTeacher.totalCarga}</p>
                  <p className="text-xs text-muted-foreground">Total asignaciones</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedTeacher.practicasAsesoradas}</p>
                  <p className="text-xs text-muted-foreground">Prácticas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedTeacher.tesisAsesoradas}</p>
                  <p className="text-xs text-muted-foreground">Tesis (asesor)</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">{selectedTeacher.tesisJurado}</p>
                  <p className="text-xs text-muted-foreground">Tesis (jurado)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista detallada */}
        <div className="space-y-3">
          <h3 className="font-semibold">Asignaciones ({selectedTeacher.detalle.length})</h3>
          {selectedTeacher.detalle.length === 0 ? (
            <div className="text-center py-8 bg-muted rounded-xl">
              <p className="text-muted-foreground">No tiene asignaciones activas</p>
            </div>
          ) : (
            selectedTeacher.detalle.map((item) => (
              <div
                key={`${item.tipo}-${item.id}`}
                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
              >
                <div className="p-2 rounded-lg bg-secondary">
                  {item.tipo === 'practica' ? (
                    <Briefcase className="w-5 h-5 text-foreground" />
                  ) : item.tipo === 'tesis_asesor' ? (
                    <BookOpen className="w-5 h-5 text-foreground" />
                  ) : item.rol === 'presidente' ? (
                    <Crown className="w-5 h-5 text-foreground" />
                  ) : item.rol === 'secretario' ? (
                    <FileText className="w-5 h-5 text-foreground" />
                  ) : (
                    <Mic className="w-5 h-5 text-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.titulo}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.estudiante} • {item.tipo === 'practica' ? 'Práctica' : 'Tesis'}
                    {item.rol && <span className="ml-1 text-muted-foreground">({item.rol})</span>}
                  </p>
                </div>
                <span className="px-2 py-1 bg-muted rounded text-xs">{item.estado}</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Disponibilidad de Docentes</h2>
            <p className="text-sm text-muted-foreground">
              Carga de trabajo de {stats.total} docentes activos
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-muted border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">{stats.available} Disponibles</span>
          </div>
          <div className="px-3 py-1.5 bg-destructive/10 border border-border rounded-lg">
            <span className="text-sm font-medium text-destructive">{stats.overloaded} Sobrecargados</span>
          </div>
          <div className="px-3 py-1.5 bg-primary/10 border border-border rounded-lg">
            <span className="text-sm font-medium text-primary">Promedio: {stats.avgLoad}</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar docente por nombre, email o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('load')}
            className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
              sortBy === 'load'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Por carga
          </button>
          <button
            onClick={() => setSortBy('name')}
            className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
              sortBy === 'name'
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'border-border hover:bg-muted'
            }`}
          >
            <UserCheck className="w-4 h-4 inline mr-1" />
            Por nombre
          </button>
        </div>
      </div>

      {/* Lista de docentes */}
      <div className="space-y-3">
        {filteredTeachers.map((teacher) => (
          <motion.button
            key={teacher.id}
            onClick={() => setSelectedTeacher(teacher)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-card border border-border rounded-xl p-5 text-left hover:shadow-md transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {teacher.nombre} {teacher.apellidoPaterno} {teacher.apellidoMaterno}
                  </h3>
                  <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  {(teacher.especialidad || teacher.facultad) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {teacher.especialidad && <span>{teacher.especialidad}</span>}
                      {teacher.facultad && <span className="ml-2">• {teacher.facultad}</span>}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Resumen de carga */}
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-foreground">{teacher.practicasAsesoradas}</p>
                    <p className="text-xs text-muted-foreground">Prácticas</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{teacher.tesisAsesoradas}</p>
                    <p className="text-xs text-muted-foreground">Asesorías</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{teacher.tesisJurado}</p>
                    <p className="text-xs text-muted-foreground">Jurado</p>
                  </div>
                </div>

                {/* Barra de carga */}
                <div className="w-32">
                  <div className="flex justify-between text-xs mb-1">
                    <span className={teacher.totalCarga > 0 ? 'font-medium' : 'text-muted-foreground'}>
                      {getCargaLabel(teacher.cargaPorcentaje, teacher.totalCarga)}
                    </span>
                    <span className="text-muted-foreground">{teacher.totalCarga}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getCargaColor(
                        teacher.cargaPorcentaje,
                        teacher.totalCarga
                      )}`}
                      style={{ width: `${teacher.cargaPorcentaje || 5}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
