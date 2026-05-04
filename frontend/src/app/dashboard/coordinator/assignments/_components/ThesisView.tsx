'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  UserCheck,
  Users,
  Plus,
  GraduationCap,
  Mail,
  Calendar,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
  Crown,
  FileText,
  Mic,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface Advisor {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  especialidad?: string;
  docenteId?: number;
}

interface Assignment {
  id: number;
  tipo: 'asesor' | 'jurado';
  rolEspecifico?: 'presidente' | 'secretario' | 'vocal';
  docente: Advisor;
}

interface ThesisProject {
  id: number;
  titulo: string;
  estado: string;
  fechaRegistro?: string;
  estudiante: {
    id: number;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno?: string;
    };
    codigo?: string;
    carrera?: {
      nombre: string;
    };
  };
  asignaciones: Assignment[];
}

interface ThesisViewProps {
  projects: ThesisProject[];
  advisors: Advisor[];
  onBack: () => void;
  onAssign: (dto: {
    proyectoId: number;
    docenteId: number;
    tipo: 'asesor' | 'jurado';
    rolEspecifico?: string;
  }) => Promise<void>;
  onRemove: (assignmentId: number) => Promise<void>;
}

type FilterType = 'all' | 'noAdvisor' | 'noJury' | 'incomplete' | 'complete';
type AssignmentMode = 'asesor' | 'jurado' | null;

const STATUS_CONFIG: Record<string, { label: string; color: string; canAssign: boolean }> = {
  'aprobado': { label: 'Aprobado', color: 'bg-primary/10 text-primary', canAssign: true },
  'en_desarrollo': { label: 'En Desarrollo', color: 'bg-secondary text-secondary-foreground', canAssign: true },
  'en_registro': { label: 'En Registro', color: 'bg-muted text-muted-foreground', canAssign: false },
  'propuesto': { label: 'Propuesto', color: 'bg-accent text-accent-foreground', canAssign: false },
  'culminado': { label: 'Culminado', color: 'bg-muted text-muted-foreground', canAssign: false },
  'cancelado': { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', canAssign: false },
};

const ROL_CONFIG = {
  presidente: { icon: Crown, color: 'bg-secondary', label: 'Presidente' },
  secretario: { icon: FileText, color: 'bg-secondary', label: 'Secretario' },
  vocal: { icon: Mic, color: 'bg-secondary', label: 'Vocal' },
};

export function ThesisView({ projects, advisors, onBack, onAssign, onRemove }: ThesisViewProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedProject, setSelectedProject] = useState<ThesisProject | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<AssignmentMode>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [juradoRole, setJuradoRole] = useState<'presidente' | 'secretario' | 'vocal'>('vocal');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = useMemo(() => {
    let filtered = projects;

    // Aplicar filtros
    if (filterType === 'noAdvisor') {
      filtered = filtered.filter((p) => !(p.asignaciones ?? []).some((a) => a.tipo === 'asesor'));
    } else if (filterType === 'noJury') {
      filtered = filtered.filter((p) => (p.asignaciones ?? []).filter((a) => a.tipo === 'jurado').length === 0);
    } else if (filterType === 'incomplete') {
      filtered = filtered.filter((p) => {
        const jurados = (p.asignaciones ?? []).filter((a) => a.tipo === 'jurado');
        return jurados.length > 0 && jurados.length < 3;
      });
    } else if (filterType === 'complete') {
      filtered = filtered.filter((p) => {
        const hasAdvisor = (p.asignaciones ?? []).some((a) => a.tipo === 'asesor');
        const jurados = (p.asignaciones ?? []).filter((a) => a.tipo === 'jurado');
        return hasAdvisor && jurados.length >= 3;
      });
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          `${p.estudiante.usuario.nombre} ${p.estudiante.usuario.apellidoPaterno}`.toLowerCase().includes(term) ||
          p.estudiante.codigo?.toLowerCase().includes(term) ||
          p.estudiante.carrera?.nombre?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [projects, filterType, searchTerm]);

  const stats = useMemo(() => {
    const total = projects.length;
    const noAdvisor = projects.filter((p) => !(p.asignaciones ?? []).some((a) => a.tipo === 'asesor')).length;
    const incompleteJury = projects.filter((p) => {
      const jurados = (p.asignaciones ?? []).filter((a) => a.tipo === 'jurado');
      return jurados.length > 0 && jurados.length < 3;
    }).length;
    const complete = projects.filter((p) => {
      const hasAdvisor = (p.asignaciones ?? []).some((a) => a.tipo === 'asesor');
      const jurados = (p.asignaciones ?? []).filter((a) => a.tipo === 'jurado');
      return hasAdvisor && jurados.length >= 3;
    }).length;
    return { total, noAdvisor, incompleteJury, complete };
  }, [projects]);

  const getAvailableAdvisors = () => {
    if (!selectedProject) return advisors;
    // Get all assigned docente IDs (both asesor and jurado) - exclude ALL assigned to this project
    const assignedIds = (selectedProject.asignaciones ?? []).map((a) => Number(a.docente.id));
    return advisors.filter((a) => !assignedIds.includes(Number(a.docenteId)));
  };

  const handleAssign = async () => {
    if (!selectedProject || !selectedAdvisor || !assignmentMode) return;

    try {
      setIsProcessing(true);
      await onAssign({
        proyectoId: selectedProject.id,
        docenteId: selectedAdvisor.id,
        tipo: assignmentMode,
        rolEspecifico: assignmentMode === 'jurado' ? juradoRole : undefined,
      });
      toast({
        title: '¡Asignación exitosa!',
        description: `${selectedAdvisor.nombre} ${selectedAdvisor.apellidoPaterno} ha sido asignado como ${assignmentMode}.`,
      });
      setSelectedProject(null);
      setAssignmentMode(null);
      setSelectedAdvisor(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo realizar la asignación',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = async (assignmentId: number) => {
    try {
      setIsProcessing(true);
      await onRemove(assignmentId);
      toast({
        title: 'Asignación eliminada',
        description: 'La asignación ha sido removida exitosamente.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar la asignación',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Modal de asignación
  if (selectedProject && assignmentMode) {
    const availableAdvisors = getAvailableAdvisors();

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setAssignmentMode(null);
              setSelectedAdvisor(null);
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">
              Asignar {assignmentMode === 'asesor' ? 'Asesor' : 'Jurado'}
            </h2>
            <p className="text-sm text-muted-foreground">Seleccione un docente para el proyecto</p>
          </div>
        </div>

        {/* Detalle del proyecto */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedProject.titulo}</h3>
              <p className="text-sm text-muted-foreground">
                Estudiante: {selectedProject.estudiante.usuario.nombre}{' '}
                {selectedProject.estudiante.usuario.apellidoPaterno}
              </p>
              <div className="flex gap-2 mt-2">
                {selectedProject.estudiante.carrera && (
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                    {selectedProject.estudiante.carrera.nombre}
                  </span>
                )}
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                  {STATUS_CONFIG[selectedProject.estado]?.label || selectedProject.estado}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de rol para jurado */}
        {assignmentMode === 'jurado' && (
          <div className="bg-muted/50 border border-border rounded-xl p-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Rol específico del jurado
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['presidente', 'secretario', 'vocal'] as const).map((rol) => {
                const config = ROL_CONFIG[rol];
                const Icon = config.icon;
                return (
                  <button
                    key={rol}
                    onClick={() => setJuradoRole(rol)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                      juradoRole === rol
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-foreground hover:bg-muted border border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de docentes */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Docentes Disponibles ({availableAdvisors.length})
          </h3>
          {availableAdvisors.length === 0 ? (
            <div className="text-center py-8 bg-muted/30 border border-border rounded-xl">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No hay docentes disponibles para asignar.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Todos los docentes ya están asignados a este proyecto.
              </p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
            {availableAdvisors.map((advisor) => (
              <button
                key={advisor.id}
                onClick={() => setSelectedAdvisor(advisor)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedAdvisor?.id === advisor.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">
                      {advisor.nombre} {advisor.apellidoPaterno} {advisor.apellidoMaterno}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {advisor.email}
                    </p>
                    {advisor.especialidad && (
                      <p className="text-xs text-muted-foreground mt-1">{advisor.especialidad}</p>
                    )}
                  </div>
                  {selectedAdvisor?.id === advisor.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
          )}
        </div>

        {/* Botón de confirmar */}
        {selectedAdvisor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-xl rounded-xl p-4 flex items-center gap-4"
          >
            <div>
              <p className="text-sm text-muted-foreground">
                {assignmentMode === 'asesor' ? 'Asesor' : 'Jurado'} seleccionado
                {assignmentMode === 'jurado' && (
                  <span className="ml-1 text-primary">({ROL_CONFIG[juradoRole].label})</span>
                )}
              </p>
              <p className="font-medium">
                {selectedAdvisor.nombre} {selectedAdvisor.apellidoPaterno}
              </p>
            </div>
            <Button onClick={handleAssign} disabled={isProcessing}>
              {isProcessing ? 'Asignando...' : 'Confirmar Asignación'}
            </Button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Asignación de Asesores y Jurados a Tesis</h2>
            <p className="text-sm text-muted-foreground">
              {stats.noAdvisor} sin asesor • {stats.incompleteJury} con jurado incompleto
            </p>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="flex flex-wrap gap-2">
          <div className="px-3 py-1.5 bg-muted border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">{stats.noAdvisor} Sin Asesor</span>
          </div>
          <div className="px-3 py-1.5 bg-muted border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">{stats.incompleteJury} Jurado Incompleto</span>
          </div>
          <div className="px-3 py-1.5 bg-primary/10 border border-border rounded-lg">
            <span className="text-sm font-medium text-primary">{stats.complete} Completos</span>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por título, estudiante, código o carrera..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border hover:bg-muted'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="flex flex-wrap gap-2 pt-2 border-t border-border"
            >
              {[
                { key: 'all', label: 'Todos' },
                { key: 'noAdvisor', label: 'Sin Asesor' },
                { key: 'noJury', label: 'Sin Jurado' },
                { key: 'incomplete', label: 'Jurado Incompleto' },
                { key: 'complete', label: 'Completos' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setFilterType(filter.key as FilterType)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filterType === filter.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de tesis */}
      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary/40" />
            <h3 className="text-lg font-medium">No hay proyectos pendientes</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Todos los proyectos tienen asesor y jurado completo
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const statusConfig = STATUS_CONFIG[project.estado] || {
              label: project.estado,
              color: 'bg-muted text-muted-foreground',
              canAssign: false,
            };
            const advisors = (project.asignaciones ?? []).filter((a) => a.tipo === 'asesor');
            const jurados = (project.asignaciones ?? []).filter((a) => a.tipo === 'jurado');
            const hasCompleteJury = jurados.length >= 3;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${hasCompleteJury ? 'bg-primary/10' : 'bg-secondary'}`}>
                        <BookOpen className={`w-6 h-6 ${hasCompleteJury ? 'text-primary' : 'text-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold">{project.titulo}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                          {!hasCompleteJury && jurados.length > 0 && (
                            <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                              Jurado incompleto ({jurados.length}/3)
                            </span>
                          )}
                          {hasCompleteJury && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Completo
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {project.estudiante.usuario.nombre} {project.estudiante.usuario.apellidoPaterno}
                          {project.estudiante.codigo && ` • Código: ${project.estudiante.codigo}`}
                        </p>
                        {project.estudiante.carrera && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {project.estudiante.carrera.nombre}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Asignaciones actuales */}
                  <div className="mt-4 space-y-3">
                    {/* Asesores */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-20">Asesor:</span>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {advisors.length > 0 ? (
                          advisors.map((a) => (
                            <div
                              key={a.id}
                              className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-border rounded-lg"
                            >
                              <UserCheck className="w-4 h-4 text-primary" />
                              <span className="text-sm">
                                {a.docente.nombre} {a.docente.apellidoPaterno}
                              </span>
                              <button
                                onClick={() => handleRemove(a.id)}
                                className="p-1 hover:bg-primary/20 rounded transition-colors"
                              >
                                <Trash2 className="w-3 h-3 text-primary" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Sin asesor asignado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Jurados */}
                    <div className="flex items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground w-20">Jurado:</span>
                      <div className="flex-1 flex flex-wrap gap-2">
                        {jurados.length > 0 ? (
                          jurados.map((j) => {
                            const rolConfig = j.rolEspecifico ? ROL_CONFIG[j.rolEspecifico] : null;
                            const RolIcon = rolConfig?.icon || Users;
                            return (
                              <div
                                key={j.id}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-secondary border-border`}
                              >
                                <RolIcon className="w-4 h-4" />
                                <span className="text-sm">
                                  {j.docente.nombre} {j.docente.apellidoPaterno}
                                  {rolConfig && <span className="ml-1 opacity-75">({rolConfig.label})</span>}
                                </span>
                                <button
                                  onClick={() => handleRemove(j.id)}
                                  className="p-1 hover:bg-black/5 rounded transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Sin jurado asignado
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  {statusConfig.canAssign && (
                    <div className="mt-4 flex gap-2 pt-4 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setAssignmentMode('asesor');
                        }}
                        disabled={advisors.length > 0}
                        className={advisors.length > 0 ? 'opacity-50' : ''}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {advisors.length > 0 ? 'Asesor Asignado' : 'Asignar Asesor'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProject(project);
                          setAssignmentMode('jurado');
                        }}
                        disabled={hasCompleteJury}
                        className={hasCompleteJury ? 'opacity-50' : ''}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {hasCompleteJury ? 'Jurado Completo' : 'Agregar Jurado'}
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
