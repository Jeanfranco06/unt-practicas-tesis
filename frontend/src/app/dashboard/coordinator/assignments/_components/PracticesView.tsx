'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  UserCheck,
  Plus,
  Building2,
  GraduationCap,
  Mail,
  Calendar,
  ArrowLeft,
  X,
  CheckCircle2,
  AlertCircle,
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
  facultad?: string;
}

interface Internship {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  estudiante: {
    id: number;
    codigo: string;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email?: string;
    };
    carrera?: {
      nombre: string;
      facultad?: {
        nombre: string;
      };
    };
  };
  empresa?: {
    id: number;
    razonSocial: string;
    ruc?: string;
  };
  nombreEmpresaExterna?: string;
  asesorAcademico?: Advisor;
  convenio?: {
    id: number;
    tipo: string;
  };
}

interface PracticesViewProps {
  internships: Internship[];
  advisors: Advisor[];
  onBack: () => void;
  onAssign: (internshipId: number, advisorId: number) => Promise<void>;
}

type FilterType = 'all' | 'pending' | 'assigned';
type SortType = 'date' | 'name' | 'company';

export function PracticesView({ internships, advisors, onBack, onAssign }: PracticesViewProps) {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('date');
  const [selectedInternship, setSelectedInternship] = useState<Internship | null>(null);
  const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar y ordenar prácticas
  const filteredInternships = useMemo(() => {
    let filtered = internships;

    // Aplicar filtro de tipo
    if (filterType === 'pending') {
      filtered = filtered.filter((i) => !i.asesorAcademico);
    } else if (filterType === 'assigned') {
      filtered = filtered.filter((i) => i.asesorAcademico);
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          `${i.estudiante.usuario.nombre} ${i.estudiante.usuario.apellidoPaterno}`.toLowerCase().includes(term) ||
          i.estudiante.codigo.toLowerCase().includes(term) ||
          (i.empresa?.razonSocial || i.nombreEmpresaExterna || '').toLowerCase().includes(term) ||
          i.estudiante.carrera?.nombre?.toLowerCase().includes(term) ||
          i.estudiante.carrera?.facultad?.nombre?.toLowerCase().includes(term)
      );
    }

    // Aplicar ordenamiento
    filtered = [...filtered].sort((a, b) => {
      switch (sortType) {
        case 'date':
          return new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime();
        case 'name':
          return `${a.estudiante.usuario.apellidoPaterno} ${a.estudiante.usuario.nombre}`.localeCompare(
            `${b.estudiante.usuario.apellidoPaterno} ${b.estudiante.usuario.nombre}`
          );
        case 'company':
          return (a.empresa?.razonSocial || a.nombreEmpresaExterna || '').localeCompare(
            b.empresa?.razonSocial || b.nombreEmpresaExterna || ''
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [internships, filterType, searchTerm, sortType]);

  const stats = useMemo(() => {
    const total = internships.length;
    const pending = internships.filter((i) => !i.asesorAcademico).length;
    const assigned = total - pending;
    return { total, pending, assigned };
  }, [internships]);

  const handleAssign = async () => {
    if (!selectedInternship || !selectedAdvisor) return;

    try {
      setIsAssigning(true);
      await onAssign(selectedInternship.id, selectedAdvisor.id);
      toast({
        title: '¡Asignación exitosa!',
        description: `${selectedAdvisor.nombre} ${selectedAdvisor.apellidoPaterno} ha sido asignado como asesor.`,
      });
      setSelectedInternship(null);
      setSelectedAdvisor(null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo realizar la asignación',
        variant: 'destructive',
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Modal de asignación
  if (selectedInternship) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setSelectedInternship(null);
              setSelectedAdvisor(null);
            }}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Asignar Asesor</h2>
            <p className="text-sm text-muted-foreground">
              Seleccione un docente para asesorar esta práctica
            </p>
          </div>
        </div>

        {/* Detalle de la práctica */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {selectedInternship.estudiante.usuario.nombre}{' '}
                {selectedInternship.estudiante.usuario.apellidoPaterno}
              </h3>
              <p className="text-sm text-muted-foreground">
                Código: {selectedInternship.estudiante.codigo}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedInternship.estudiante.carrera && (
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs">
                    {selectedInternship.estudiante.carrera.nombre}
                  </span>
                )}
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {new Date(selectedInternship.fechaInicio).toLocaleDateString('es-ES')}
                </span>
              </div>
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground">
                  <Building2 className="w-4 h-4 inline mr-2 text-primary" />
                  {selectedInternship.empresa?.razonSocial || selectedInternship.nombreEmpresaExterna || 'Empresa no especificada'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de docentes */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Seleccionar Docente Asesor
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {advisors.map((advisor) => (
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
                    {(advisor.especialidad || advisor.facultad) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {advisor.especialidad && <span className="mr-2">{advisor.especialidad}</span>}
                        {advisor.facultad && <span>{advisor.facultad}</span>}
                      </p>
                    )}
                  </div>
                  {selectedAdvisor?.id === advisor.id && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Botón de asignar */}
        {selectedAdvisor && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-border shadow-xl rounded-xl p-4 flex items-center gap-4"
          >
            <div>
              <p className="text-sm text-muted-foreground">Asesor seleccionado</p>
              <p className="font-medium">
                {selectedAdvisor.nombre} {selectedAdvisor.apellidoPaterno}
              </p>
            </div>
            <Button
              onClick={handleAssign}
              disabled={isAssigning}
            >
              {isAssigning ? 'Asignando...' : 'Confirmar Asignación'}
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
          <button
            onClick={onBack}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold">Asignación de Asesores a Prácticas</h2>
            <p className="text-sm text-muted-foreground">
              {stats.pending} de {stats.total} prácticas pendientes de asignación
            </p>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="flex gap-2">
          <div className="px-3 py-1.5 bg-muted border border-border rounded-lg">
            <span className="text-sm font-medium text-foreground">{stats.pending} Pendientes</span>
          </div>
          <div className="px-3 py-1.5 bg-primary/10 border border-border rounded-lg">
            <span className="text-sm font-medium text-primary">{stats.assigned} Asignados</span>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por estudiante, código, empresa, carrera o facultad..."
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
              className="flex flex-wrap gap-3 pt-2 border-t border-border"
            >
              {/* Filtro por estado */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Estado:</span>
                {(['all', 'pending', 'assigned'] as FilterType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      filterType === type
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {type === 'all' && 'Todos'}
                    {type === 'pending' && 'Sin Asesor'}
                    {type === 'assigned' && 'Con Asesor'}
                  </button>
                ))}
              </div>

              {/* Ordenamiento */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ordenar por:</span>
                {(['date', 'name', 'company'] as SortType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSortType(type)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      sortType === type
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'hover:bg-muted'
                    }`}
                  >
                    {type === 'date' && 'Fecha'}
                    {type === 'name' && 'Estudiante'}
                    {type === 'company' && 'Empresa'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de prácticas */}
      <div className="space-y-3">
        {filteredInternships.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-primary/40" />
            <h3 className="text-lg font-medium">No hay prácticas pendientes</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Todas las prácticas tienen asesor asignado
            </p>
          </div>
        ) : (
          filteredInternships.map((internship) => (
            <motion.div
              key={internship.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${internship.asesorAcademico ? 'bg-primary/10' : 'bg-secondary'}`}>
                    <Briefcase className={`w-6 h-6 ${internship.asesorAcademico ? 'text-primary' : 'text-foreground'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">
                        {internship.estudiante.usuario.nombre} {internship.estudiante.usuario.apellidoPaterno}
                      </h3>
                      {internship.asesorAcademico ? (
                        <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          Con Asesor
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Sin Asesor
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Código: {internship.estudiante.codigo}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {internship.estudiante.carrera && (
                        <span className="text-xs px-2 py-1 bg-muted rounded">
                          {internship.estudiante.carrera.nombre}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-muted rounded flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {internship.empresa?.razonSocial || internship.nombreEmpresaExterna || 'Empresa externa'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {internship.asesorAcademico ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Asesor asignado</p>
                        <p className="font-medium text-primary">
                          {internship.asesorAcademico.nombre} {internship.asesorAcademico.apellidoPaterno}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedInternship(internship)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setSelectedInternship(internship)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Asignar Asesor
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
