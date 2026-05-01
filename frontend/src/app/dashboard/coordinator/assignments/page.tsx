'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  BookOpen,
  UserCheck,
  GraduationCap,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import {
  getAdvisors,
  getPendingInternships,
  assignAdvisor,
  getThesisProjects,
  assignThesisAdvisor,
  removeThesisAssignment,
} from './../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface Advisor {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
}

interface Internship {
  id: number;
  estado: string;
  fechaInicio: string;
  estudiante: {
    id: number;
    codigo: string;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
    };
  };
  empresa?: {
    razonSocial: string;
  };
  nombreEmpresaExterna?: string;
  asesorAcademico?: Advisor;
}

interface ThesisProject {
  id: number;
  titulo: string;
  estado: string;
  estudiante: {
    id: number;
    usuario: {
      nombre: string;
      apellidoPaterno: string;
    };
  };
  asignaciones: {
    id: number;
    tipo: 'asesor' | 'jurado';
    rolEspecifico?: string;
    docente: Advisor;
  }[];
}

type TabType = 'internships' | 'thesis';

export default function AssignmentsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('internships');
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [thesisProjects, setThesisProjects] = useState<ThesisProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Internship | ThesisProject | null>(null);
  const [assignmentType, setAssignmentType] = useState<'asesor' | 'jurado'>('asesor');

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [advisorsData, internshipsData, thesisData] = await Promise.all([
        getAdvisors(),
        getPendingInternships(),
        getThesisProjects(),
      ]);
      setAdvisors(advisorsData);
      setInternships(internshipsData);
      setThesisProjects(thesisData);
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
      setProcessingId(internshipId);
      await assignAdvisor(internshipId, advisorId);
      toast({
        title: 'Éxito',
        description: 'Asesor asignado exitosamente',
        variant: 'default',
      });
      setShowAdvisorModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo asignar el asesor',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssignThesis = async (projectId: number, advisorId: number, type: 'asesor' | 'jurado') => {
    try {
      setProcessingId(projectId);
      await assignThesisAdvisor({
        proyectoId: projectId,
        docenteId: advisorId,
        tipo: type,
      });
      toast({
        title: 'Éxito',
        description: `${type === 'asesor' ? 'Asesor' : 'Jurado'} asignado exitosamente`,
        variant: 'default',
      });
      setShowAdvisorModal(false);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo realizar la asignación',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveAssignment = async (assignmentId: number) => {
    try {
      await removeThesisAssignment(assignmentId);
      toast({
        title: 'Éxito',
        description: 'Asignación eliminada exitosamente',
        variant: 'default',
      });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo eliminar la asignación',
        variant: 'destructive',
      });
    }
  };

  const openAdvisorModal = (item: Internship | ThesisProject, type: 'asesor' | 'jurado' = 'asesor') => {
    setSelectedItem(item);
    setAssignmentType(type);
    setShowAdvisorModal(true);
  };

  const filteredInternships = internships.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = item.estudiante?.usuario
      ? `${item.estudiante.usuario.nombre} ${item.estudiante.usuario.apellidoPaterno}`.toLowerCase()
      : '';
    const companyName = (item.empresa?.razonSocial || item.nombreEmpresaExterna || '').toLowerCase();
    return studentName.includes(searchLower) || companyName.includes(searchLower);
  });

  const filteredThesis = thesisProjects.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const studentName = item.estudiante?.usuario
      ? `${item.estudiante.usuario.nombre} ${item.estudiante.usuario.apellidoPaterno}`.toLowerCase()
      : '';
    return studentName.includes(searchLower) || item.titulo?.toLowerCase().includes(searchLower);
  });

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-foreground">Asignación de Asesores y Jurados</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Asigna asesores académicos a prácticas y jurados a proyectos de tesis
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants} className="flex gap-2">
        <button
          onClick={() => setActiveTab('internships')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'internships'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Prácticas
          {internships.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary-foreground/20 rounded-full">
              {internships.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('thesis')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'thesis'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Tesis
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={activeTab === 'internships' ? 'Buscar por estudiante o empresa...' : 'Buscar por estudiante o título...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {activeTab === 'internships' ? (
          filteredInternships.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-emerald-500/40" />
              <h3 className="text-lg font-medium text-foreground">No hay prácticas pendientes</h3>
              <p className="text-muted-foreground text-sm mt-2">
                Todas las prácticas tienen asesor asignado
              </p>
            </div>
          ) : (
            filteredInternships.map((internship) => (
              <motion.div
                key={internship.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {internship.estudiante?.usuario
                          ? `${internship.estudiante.usuario.nombre} ${internship.estudiante.usuario.apellidoPaterno}`
                          : 'Estudiante no disponible'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Código: {internship.estudiante?.codigo || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {internship.empresa?.razonSocial || internship.nombreEmpresaExterna || 'Empresa no especificada'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {internship.asesorAcademico ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full">
                        <UserCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-emerald-700">
                          {internship.asesorAcademico.nombre} {internship.asesorAcademico.apellidoPaterno}
                        </span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => openAdvisorModal(internship, 'asesor')}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Asignar Asesor
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )
        ) : (
          filteredThesis.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
              <h3 className="text-lg font-medium text-foreground">No hay proyectos de tesis</h3>
              <p className="text-muted-foreground text-sm mt-2">
                No se encontraron proyectos de tesis registrados
              </p>
            </div>
          ) : (
            filteredThesis.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-500/10 rounded-lg">
                        <GraduationCap className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{project.titulo || 'Título no disponible'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {project.estudiante?.usuario
                            ? `${project.estudiante.usuario.nombre} ${project.estudiante.usuario.apellidoPaterno}`
                            : 'Estudiante no disponible'}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {project.asignaciones.filter(a => a.tipo === 'asesor').map((a) => (
                            <span key={a.id} className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-700 rounded-full text-xs">
                              <UserCheck className="w-3 h-3" />
                              Asesor: {a.docente.nombre} {a.docente.apellidoPaterno}
                            </span>
                          ))}
                          {project.asignaciones.filter(a => a.tipo === 'jurado').map((a) => (
                            <span key={a.id} className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-700 rounded-full text-xs">
                              <Users className="w-3 h-3" />
                              Jurado: {a.docente.nombre} {a.docente.apellidoPaterno}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {expandedId === project.id ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === project.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-border bg-muted/20 p-6"
                    >
                      <div className="space-y-4">
                        {/* Current Assignments */}
                        {project.asignaciones.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-2">Asignaciones actuales</h4>
                            <div className="space-y-2">
                              {project.asignaciones.map((a) => (
                                <div key={a.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {a.tipo === 'asesor' ? (
                                      <UserCheck className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <Users className="w-4 h-4 text-blue-500" />
                                    )}
                                    <span className="text-sm">
                                      {a.docente.nombre} {a.docente.apellidoPaterno} ({a.tipo})
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveAssignment(a.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Add Assignment Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => openAdvisorModal(project, 'asesor')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar Asesor
                          </Button>
                          <Button
                            onClick={() => openAdvisorModal(project, 'jurado')}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Agregar Jurado
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )
        )}
      </motion.div>

      {/* Advisor Selection Modal */}
      <AnimatePresence>
        {showAdvisorModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAdvisorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    Seleccionar {assignmentType === 'asesor' ? 'Asesor' : 'Jurado'}
                  </h3>
                  <button
                    onClick={() => setShowAdvisorModal(false)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'internships'
                    ? `Asignar asesor a práctica de ${(selectedItem as Internship).estudiante?.usuario?.nombre || 'estudiante'}`
                    : `Asignar ${assignmentType} a "${(selectedItem as ThesisProject).titulo || 'proyecto'}"`}
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[50vh]">
                <div className="space-y-2">
                  {advisors.map((advisor) => (
                    <button
                      key={advisor.id}
                      onClick={() => {
                        if (activeTab === 'internships') {
                          handleAssignAdvisor((selectedItem as Internship).id, advisor.id);
                        } else {
                          handleAssignThesis((selectedItem as ThesisProject).id, advisor.id, assignmentType);
                        }
                      }}
                      disabled={processingId !== null}
                      className="w-full flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {advisor.nombre} {advisor.apellidoPaterno} {advisor.apellidoMaterno}
                        </p>
                        <p className="text-sm text-muted-foreground">{advisor.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
