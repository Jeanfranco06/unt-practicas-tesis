'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Building2,
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { CardSkeleton } from '@/components/student/LoadingState';
import {
  getAgreements,
  createAgreement,
  createAgreementWithDocument,
  updateAgreement,
  updateAgreementWithDocument,
  deleteAgreement,
  getCompanies,
  renewAgreement,
  getDocumentUrl,
} from '../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface Company {
  id: number;
  razonSocial: string;
  ruc: string;
}

interface Agreement {
  id: number;
  tipo: 'marco' | 'especifico';
  estado: 'vigente' | 'vencido' | 'cancelado';
  fechaInicio: string;
  fechaVencimiento: string;
  objetoContrato?: string;
  objeto?: string;
  documentoUrl?: string;
  empresa: Company;
}

// Obtener estado real de un convenio considerando fecha y estado almacenado
const getEstadoReal = (agreement: Agreement): 'vigente' | 'vencido' | 'cancelado' => {
  if (agreement.estado === 'cancelado') return 'cancelado';
  return calcularEstadoReal(agreement.fechaVencimiento);
};

// Calcular estado real basado en fecha
const calcularEstadoReal = (fechaVencimiento: string): 'vigente' | 'vencido' => {
  const hoy = new Date();
  const vencimiento = new Date(fechaVencimiento + 'T12:00:00'); // Agregar hora para evitar problemas de zona horaria
  // Comparar solo fechas
  hoy.setHours(0, 0, 0, 0);
  vencimiento.setHours(0, 0, 0, 0);
  return vencimiento >= hoy ? 'vigente' : 'vencido';
};

// Formatear fecha sin problema de zona horaria (suma 12 horas para compensar UTC-5)
const formatDate = (dateString: string): string => {
  const date = new Date(dateString + 'T12:00:00');
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Componente para mostrar días restantes
const DiasRestantes = ({ fechaVencimiento }: { fechaVencimiento: string }) => {
  // Usar el mismo truco de T12:00:00 para evitar problemas de zona horaria
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  const vencimiento = new Date(fechaVencimiento + 'T12:00:00');
  vencimiento.setHours(0, 0, 0, 0);
  
  const diferenciaMs = vencimiento.getTime() - hoy.getTime();
  const dias = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));
  
  const colorClass = dias <= 30 && dias > 0 ? 'text-amber-600' : dias <= 0 ? 'text-red-600' : 'text-muted-foreground';
  const mensaje = dias > 0 ? `${dias} días restantes` : dias === 0 ? 'Vence hoy' : `Vencido hace ${Math.abs(dias)} días`;
  
  return <p className={`text-sm mt-1 ${colorClass}`}>{mensaje}</p>;
};

type ModalType = 'create' | 'edit' | 'renew' | 'view' | null;

export default function AgreementsPage() {
  const { toast } = useToast();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    empresaId: '',
    tipo: 'marco' as 'marco' | 'especifico',
    objetoContrato: '',
    fechaInicio: '',
    fechaVencimiento: '',
    nuevaFechaVencimiento: '',
  });
  const [documentoFile, setDocumentoFile] = useState<File | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [agreementsData, companiesData] = await Promise.all([
        getAgreements(),
        getCompanies(),
      ]);
      setAgreements(agreementsData);
      setCompanies(companiesData);
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

  const resetForm = () => {
    setFormData({
      empresaId: '',
      tipo: 'marco',
      objetoContrato: '',
      fechaInicio: '',
      fechaVencimiento: '',
      nuevaFechaVencimiento: '',
    });
    setDocumentoFile(null);
    setSelectedAgreement(null);
    setModalType(null);
  };

  const openModal = (type: ModalType, agreement?: Agreement) => {
    setModalType(type);
    setShowHistory(false);
    if (agreement) {
      setSelectedAgreement(agreement);
      if (type === 'edit') {
        setFormData({
          empresaId: agreement.empresa.id.toString(),
          tipo: (agreement as any).tipo || 'marco',
          objetoContrato: (agreement as any).objetoContrato || (agreement as any).objeto || '',
          fechaInicio: agreement.fechaInicio.split('T')[0],
          fechaVencimiento: agreement.fechaVencimiento.split('T')[0],
          nuevaFechaVencimiento: '',
        });
        setDocumentoFile(null);
      } else if (type === 'renew') {
        setFormData({
          ...formData,
          nuevaFechaVencimiento: '',
        });
      }
      // Para 'view', no necesitamos cargar el formulario
    } else {
      setFormData({
        empresaId: '',
        tipo: 'marco',
        objetoContrato: '',
        fechaInicio: '',
        fechaVencimiento: '',
        nuevaFechaVencimiento: '',
      });
      setDocumentoFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalType === 'create') {
        const data = {
          empresaId: parseInt(formData.empresaId),
          tipo: formData.tipo,
          objetoContrato: formData.objetoContrato,
          fechaInicio: formData.fechaInicio,
          fechaVencimiento: formData.fechaVencimiento,
        };
        
        // Usar FormData si hay documento adjunto
        if (documentoFile) {
          await createAgreementWithDocument(data, documentoFile);
        } else {
          await createAgreement(data);
        }
        toast({ title: 'Éxito', description: 'Convenio creado exitosamente' });
      } else if (modalType === 'edit' && selectedAgreement) {
        const data = {
          empresaId: parseInt(formData.empresaId),
          tipo: formData.tipo,
          objetoContrato: formData.objetoContrato,
          fechaInicio: formData.fechaInicio,
          fechaVencimiento: formData.fechaVencimiento,
        };
        
        // Usar FormData si hay documento adjunto
        if (documentoFile) {
          await updateAgreementWithDocument(selectedAgreement.id, data, documentoFile);
        } else {
          await updateAgreement(selectedAgreement.id, data);
        }
        toast({ title: 'Éxito', description: 'Convenio actualizado exitosamente' });
      } else if (modalType === 'renew' && selectedAgreement) {
        await renewAgreement(selectedAgreement.id, formData.nuevaFechaVencimiento);
        toast({ title: 'Éxito', description: 'Convenio renovado exitosamente' });
      }
      resetForm();
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo guardar el convenio',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este convenio?\n\nEl convenio pasará a estado CANCELADO y no se podrá utilizar para nuevas prácticas.')) return;

    try {
      await deleteAgreement(id);
      toast({ title: 'Éxito', description: 'Convenio cancelado exitosamente' });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo cancelar el convenio',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (agreement: Agreement) => {
    const estadoReal = getEstadoReal(agreement);
    if (estadoReal === 'cancelado') {
      return 'bg-gray-500/10 text-gray-700';
    }
    return estadoReal === 'vigente'
      ? 'bg-emerald-500/10 text-emerald-700'
      : 'bg-red-500/10 text-red-700';
  };

  const getStatusIcon = (agreement: Agreement) => {
    const estadoReal = getEstadoReal(agreement);
    if (estadoReal === 'cancelado') {
      return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
    return estadoReal === 'vigente'
      ? <CheckCircle className="w-4 h-4 text-emerald-600" />
      : <XCircle className="w-4 h-4 text-red-600" />;
  };

  const getStatusText = (agreement: Agreement) => {
    const estadoReal = getEstadoReal(agreement);
    if (estadoReal === 'cancelado') return 'Cancelado';
    return estadoReal === 'vigente' ? 'Vigente' : 'Vencido';
  };

  const isExpiringSoon = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  // Obtener convenios existentes de una empresa (vigentes calculados por fecha, no cancelados)
  const getExistingAgreementsForCompany = (empresaId: string) => {
    if (!empresaId) return [];
    return agreements.filter(a => 
      a.empresa.id.toString() === empresaId && 
      getEstadoReal(a) === 'vigente'
    );
  };

  const filteredAgreements = agreements.filter((agreement) => {
    const searchLower = searchTerm.toLowerCase();
    const tipo = agreement.tipo?.toLowerCase() || '';
    const objeto = (agreement.objetoContrato || agreement.objeto || '')?.toLowerCase();
    const razonSocial = agreement.empresa?.razonSocial?.toLowerCase() || '';
    const ruc = agreement.empresa?.ruc?.toLowerCase() || '';
    return (
      tipo.includes(searchLower) ||
      objeto.includes(searchLower) ||
      razonSocial.includes(searchLower) ||
      ruc.includes(searchLower)
    );
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
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestión de Convenios</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Administra los convenios con empresas para prácticas preprofesionales
          </p>
        </div>
        <Button
          onClick={() => openModal('create')}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Convenio
        </Button>
      </motion.div>

      {/* Stats - Usar estado calculado por fecha, no el estado almacenado */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vigentes', value: agreements.filter(a => getEstadoReal(a) === 'vigente').length, color: 'text-emerald-600' },
          { label: 'Vencidos', value: agreements.filter(a => getEstadoReal(a) === 'vencido').length, color: 'text-red-600' },
          { label: 'Cancelados', value: agreements.filter(a => getEstadoReal(a) === 'cancelado').length, color: 'text-gray-600' },
          { label: 'Por vencer', value: agreements.filter(a => getEstadoReal(a) === 'vigente' && isExpiringSoon(a.fechaVencimiento)).length, color: 'text-amber-600' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-card rounded-xl border border-border">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por código, empresa o RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border"
          />
        </div>
      </motion.div>

      {/* Agreements List */}
      <motion.div variants={itemVariants} className="grid gap-4">
        {filteredAgreements.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-border">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/40" />
            <h3 className="text-lg font-medium text-foreground">No hay convenios</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Crea un nuevo convenio para comenzar
            </p>
          </div>
        ) : (
          filteredAgreements.map((agreement) => (
            <motion.div
              key={agreement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        agreement.tipo === 'marco'
                          ? 'bg-purple-500/10 text-purple-700'
                          : 'bg-emerald-500/10 text-emerald-700'
                      }`}>
                        {agreement.tipo === 'marco' ? 'Marco' : 'Específico'}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(agreement)}`}>
                        {getStatusIcon(agreement)}
                        {getStatusText(agreement)}
                      </span>
                      {isExpiringSoon(agreement.fechaVencimiento) && getEstadoReal(agreement) === 'vigente' && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/10 text-amber-700">
                          <AlertCircle className="w-3 h-3" />
                          Por vencer
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {agreement.empresa.razonSocial}
                      </span>
                      <span className="text-muted-foreground/40">|</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(agreement.fechaInicio)} - {formatDate(agreement.fechaVencimiento)}
                      </span>
                    </div>
                    {(agreement.objetoContrato || agreement.objeto) && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {agreement.objetoContrato || agreement.objeto}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Botón Ver detalles */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('view', agreement)}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                  {/* Mostrar botón renovar para convenios vigentes o vencidos (no cancelados) */}
                  {agreement.estado !== 'cancelado' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal('renew', agreement)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {calcularEstadoReal(agreement.fechaVencimiento) === 'vencido' ? 'Renovar (Vencido)' : 'Renovar'}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal('edit', agreement)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(agreement.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => resetForm()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {modalType === 'create' && 'Nuevo Convenio'}
                    {modalType === 'edit' && 'Editar Convenio'}
                    {modalType === 'renew' && 'Renovar Convenio'}
                    {modalType === 'view' && 'Detalles del Convenio'}
                  </h3>
                  <button
                    onClick={() => resetForm()}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {modalType === 'view' && selectedAgreement ? (
                // Vista de detalles
                <div className="p-6 space-y-6">
                  {/* Estado y tipo */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
                      selectedAgreement.tipo === 'marco' 
                        ? 'bg-purple-500/10 text-purple-700' 
                        : 'bg-emerald-500/10 text-emerald-700'
                    }`}>
                      {selectedAgreement.tipo === 'marco' ? 'Convenio Marco' : 'Convenio Específico'}
                    </span>
                    <span className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedAgreement)}`}>
                      {getStatusIcon(selectedAgreement)}
                      {getStatusText(selectedAgreement)}
                    </span>
                    {isExpiringSoon(selectedAgreement.fechaVencimiento) && getEstadoReal(selectedAgreement) === 'vigente' && (
                      <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-amber-500/10 text-amber-700">
                        <AlertCircle className="w-4 h-4" />
                        Por vencer
                      </span>
                    )}
                  </div>

                  {/* Empresa */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Empresa</h4>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-foreground" />
                      <span className="text-lg font-semibold text-foreground">{selectedAgreement.empresa.razonSocial}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">RUC: {selectedAgreement.empresa.ruc}</p>
                  </div>

                  {/* Fechas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha de Inicio
                      </h4>
                      <p className="text-lg font-semibold text-foreground">{formatDate(selectedAgreement.fechaInicio)}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Fecha de Vencimiento
                      </h4>
                      <p className="text-lg font-semibold text-foreground">{formatDate(selectedAgreement.fechaVencimiento)}</p>
                      <DiasRestantes fechaVencimiento={selectedAgreement.fechaVencimiento} />
                    </div>
                  </div>

                  {/* Objeto del contrato */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Objeto del Contrato</h4>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <p className="text-foreground whitespace-pre-wrap">{selectedAgreement.objetoContrato || selectedAgreement.objeto || 'No especificado'}</p>
                    </div>
                  </div>

                  {/* Documento */}
                  {selectedAgreement.documentoUrl && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Documento Adjunto</h4>
                      <a
                        href={getDocumentUrl(selectedAgreement.documentoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors"
                      >
                        <FileText className="w-8 h-8 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-blue-700 truncate">{selectedAgreement.documentoUrl?.split('/').pop()}</p>
                          <p className="text-xs text-blue-600">Click para descargar/ver</p>
                        </div>
                        <Download className="w-5 h-5 text-blue-600" />
                      </a>
                    </div>
                  )}

                  {/* Historial de renovaciones (placeholder) */}
                  <div>
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                      Historial de Renovaciones
                    </button>
                    {showHistory && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-muted/50 rounded-lg"
                      >
                        <p className="text-sm text-muted-foreground">
                          {/* Aquí se mostraría el historial real del backend */}
                          Convenio creado el {formatDate(selectedAgreement.fechaInicio)}
                          <br />
                          Última actualización: {formatDate(selectedAgreement.fechaVencimiento)}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex gap-3 pt-4 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openModal('edit', selectedAgreement)}
                      className="flex-1"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    {selectedAgreement.estado !== 'cancelado' && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => openModal('renew', selectedAgreement)}
                        className="flex-1"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renovar
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                // Formulario (create, edit, renew)
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {modalType === 'renew' ? (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nueva Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.nuevaFechaVencimiento}
                      onChange={(e) => setFormData({ ...formData, nuevaFechaVencimiento: e.target.value })}
                      className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tipo de Convenio <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tipo: 'marco' })}
                          className={`flex-1 p-3 border rounded-lg text-sm font-medium transition-colors ${
                            formData.tipo === 'marco'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-background border-border hover:bg-muted/50'
                          }`}
                        >
                          Marco
                          <span className="block text-xs font-normal opacity-80 mt-1">
                            Convenio general con la empresa
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tipo: 'especifico' })}
                          className={`flex-1 p-3 border rounded-lg text-sm font-medium transition-colors ${
                            formData.tipo === 'especifico'
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-background border-border hover:bg-muted/50'
                          }`}
                        >
                          Específico
                          <span className="block text-xs font-normal opacity-80 mt-1">
                            Para un proyecto o práctica particular
                          </span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Empresa <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.empresaId}
                        onChange={(e) => setFormData({ ...formData, empresaId: e.target.value })}
                        className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      >
                        <option value="">Seleccionar empresa</option>
                        {companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.razonSocial} (RUC: {company.ruc})
                          </option>
                        ))}
                      </select>
                      
                      {/* Mostrar convenios existentes de la empresa seleccionada */}
                      {modalType === 'create' && formData.empresaId && (
                        <div className="mt-3">
                          {getExistingAgreementsForCompany(formData.empresaId).length > 0 ? (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <p className="text-sm font-medium text-amber-800 mb-2">
                                ⚠️ Esta empresa ya tiene convenios vigentes:
                              </p>
                              <ul className="space-y-1">
                                {getExistingAgreementsForCompany(formData.empresaId).map((agreement) => (
                                  <li key={agreement.id} className="text-sm text-amber-700 flex items-center gap-2">
                                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                                      agreement.tipo === 'marco' 
                                        ? 'bg-purple-100 text-purple-700' 
                                        : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                      {agreement.tipo === 'marco' ? 'Marco' : 'Específico'}
                                    </span>
                                    <span className="truncate">
                                      {agreement.objetoContrato || agreement.objeto || 'Sin descripción'}
                                    </span>
                                    <span className="text-xs text-amber-600">
                                      (Vence: {formatDate(agreement.fechaVencimiento)})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                              <p className="text-xs text-amber-600 mt-2">
                                Nota: No puede crear otro convenio del mismo tipo. Seleccione un tipo diferente o renueve el existente.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              ✓ Esta empresa no tiene convenios vigentes actualmente.
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Fecha de Inicio
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.fechaInicio}
                          onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                          className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Fecha de Vencimiento
                        </label>
                        <input
                          type="date"
                          required
                          value={formData.fechaVencimiento}
                          onChange={(e) => setFormData({ ...formData, fechaVencimiento: e.target.value })}
                          className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Objeto del Contrato <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        value={formData.objetoContrato}
                        onChange={(e) => setFormData({ ...formData, objetoContrato: e.target.value })}
                        placeholder="Describa el objeto o propósito del convenio..."
                        rows={3}
                        className="w-full p-3 bg-background border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Ej: "Prácticas pre-profesionales de estudiantes de ingeniería"
                      </p>
                    </div>

                    {/* Campo de documento adjunto */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Documento del Convenio
                      </label>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setDocumentoFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="documento-file"
                        />
                        <label
                          htmlFor="documento-file"
                          className="flex items-center gap-2 w-full p-3 bg-background border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                        >
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground truncate">
                            {documentoFile ? documentoFile.name : 'Seleccionar archivo (PDF, DOC, DOCX)'}
                          </span>
                        </label>
                        {documentoFile && (
                          <button
                            type="button"
                            onClick={() => setDocumentoFile(null)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        )}
                      </div>
                      {selectedAgreement?.documentoUrl && !documentoFile && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Documento actual: <a href={getDocumentUrl(selectedAgreement.documentoUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver documento</a>
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => resetForm()}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  >
                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
