'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CardSkeleton } from '@/components/student/LoadingState';
import { useToast } from '@/components/ui/use-toast';
import {
  getAdvisors,
  getPendingInternships,
  getAllInternships,
  assignAdvisor,
  getThesisProjects,
  assignThesisAdvisor,
  removeThesisAssignment,
} from './../_lib/api';
import { AssignmentDashboard } from './_components/AssignmentDashboard';
import { PracticesView } from './_components/PracticesView';
import { ThesisView } from './_components/ThesisView';
import { TeachersView } from './_components/TeachersView';

// Interfaces
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

interface Internship {
  id: number;
  estado: string;
  fechaInicio: string;
  fechaFin?: string;
  estudiante: {
    id: number;
    codigoUniversitario: string;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email?: string;
    };
    carrera?: {
      nombre: string;
      facultad?: { nombre: string };
    };
  };
  empresa?: { id: number; razonSocial: string; ruc?: string };
  nombreEmpresaExterna?: string;
  asesorAcademico?: Advisor;
  convenio?: { id: number; tipo: string };
}

interface ThesisProject {
  id: number;
  titulo: string;
  estado: string;
  fechaRegistro?: string;
  estudiante: {
    id: number;
    codigo?: string;
    usuario: { nombre: string; apellidoPaterno: string; apellidoMaterno?: string };
    carrera?: { nombre: string };
  };
  asignaciones: {
    id: number;
    tipo: 'asesor' | 'jurado';
    rolEspecifico?: 'presidente' | 'secretario' | 'vocal';
    docente: Advisor;
  }[];
}

type ViewType = 'dashboard' | 'practices' | 'thesis' | 'teachers';

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [thesisProjects, setThesisProjects] = useState<ThesisProject[]>([]);
  const [allInternships, setAllInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [advisorsData, internshipsData, thesisData, allInternshipsData] = await Promise.all([
        getAdvisors(),
        getPendingInternships(),
        getThesisProjects(),
        getAllInternships(),
      ]);
      setAdvisors(advisorsData);
      setInternships(internshipsData);
      setThesisProjects(thesisData);
      setAllInternships(allInternshipsData);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignAdvisor = async (internshipId: number, advisorId: number) => {
    try {
      await assignAdvisor(internshipId, advisorId);
      toast({ title: 'Éxito', description: 'Asesor asignado exitosamente' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo asignar', variant: 'destructive' });
      throw err;
    }
  };

  const handleAssignThesis = async (dto: {
    proyectoId: number;
    docenteId: number;
    tipo: 'asesor' | 'jurado';
    rolEspecifico?: string;
  }) => {
    try {
      await assignThesisAdvisor(dto);
      toast({ title: 'Éxito', description: `${dto.tipo === 'asesor' ? 'Asesor' : 'Jurado'} asignado exitosamente` });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo asignar', variant: 'destructive' });
      throw err;
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await removeThesisAssignment(assignmentId);
      toast({ title: 'Éxito', description: 'Asignación eliminada exitosamente' });
      await loadData();
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'No se pudo eliminar', variant: 'destructive' });
      throw err;
    }
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const practicasPendientes = internships.filter((i) => !i.asesorAcademico).length;
    const practicasConAsesor = internships.filter((i) => i.asesorAcademico).length;
    const tesisSinAsesor = thesisProjects.filter(
      (t) => !t.asignaciones?.some((a) => a.tipo === 'asesor')
    ).length;
    const tesisSinJurado = thesisProjects.filter(
      (t) => (t.asignaciones?.filter((a) => a.tipo === 'jurado').length || 0) < 3
    ).length;
    const tesisCompletas = thesisProjects.filter(
      (t) =>
        t.asignaciones?.some((a) => a.tipo === 'asesor') &&
        (t.asignaciones?.filter((a) => a.tipo === 'jurado').length || 0) >= 3
    ).length;
    const docentesConCarga = advisors.filter((a) => {
      const practicasCount = allInternships.filter((i) => Number(i.asesorAcademico?.id) === Number(a.id)).length;
      const tesisAsesorCount = thesisProjects.filter((t) =>
        t.asignaciones?.some((as) => as.tipo === 'asesor' && Number(as.docente.id) === Number(a.docenteId))
      ).length;
      const tesisJuradoCount = thesisProjects.filter((t) =>
        t.asignaciones?.some((as) => as.tipo === 'jurado' && Number(as.docente.id) === Number(a.docenteId))
      ).length;
      return practicasCount + tesisAsesorCount + tesisJuradoCount > 0;
    }).length;

    return {
      practicasPendientes,
      practicasConAsesor,
      tesisSinAsesor,
      tesisSinJurado,
      tesisCompletas,
      docentesDisponibles: advisors.length,
      docentesConCarga,
    };
  }, [advisors, internships, thesisProjects, allInternships]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {currentView === 'dashboard' && (
        <AssignmentDashboard
          stats={stats}
          onViewPracticas={() => setCurrentView('practices')}
          onViewTesis={() => setCurrentView('thesis')}
          onViewDocentes={() => setCurrentView('teachers')}
        />
      )}

      {currentView === 'practices' && (
        <PracticesView
          internships={internships}
          advisors={advisors}
          onBack={() => setCurrentView('dashboard')}
          onAssign={handleAssignAdvisor}
        />
      )}

      {currentView === 'thesis' && (
        <ThesisView
          projects={thesisProjects}
          advisors={advisors}
          onBack={() => setCurrentView('dashboard')}
          onAssign={handleAssignThesis}
          onRemove={handleRemoveAssignment}
        />
      )}

      {currentView === 'teachers' && (
        <TeachersView
          advisors={advisors}
          internships={allInternships}
          thesisProjects={thesisProjects}
          onBack={() => setCurrentView('dashboard')}
        />
      )}
    </motion.div>
  );
}
