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
  getCompanies,
  createAgreement,
  updateAgreement,
  renewAgreement,
  deleteAgreement,
} from './../_lib/api';

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
  codigo: string;
  estado: 'vigente' | 'vencido' | 'renovado' | 'cancelado';
  fechaInicio: string;
  fechaVencimiento: string;
  descripcion?: string;
  empresa: Company;
}

type ModalType = 'create' | 'edit' | 'renew' | null;

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
    codigo: '',
    empresaId: '',
    fechaInicio: '',
    fechaVencimiento: '',
    descripcion: '',
    nuevaFechaVencimiento: '',
  });

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
      codigo: '',
      empresaId: '',
      fechaInicio: '',
      fechaVencimiento: '',
      descripcion: '',
      nuevaFechaVencimiento: '',
    });
    setSelectedAgreement(null);
    setModalType(null);
  };

  const openModal = (type: ModalType, agreement?: Agreement) => {
    setModalType(type);
    if (agreement) {
      setSelectedAgreement(agreement);
      if (type === 'edit') {
        setFormData({
          codigo: agreement.codigo,
          empresaId: agreement.empresa.id.toString(),
          fechaInicio: agreement.fechaInicio.split('T')[0],
          fechaVencimiento: agreement.fechaVencimiento.split('T')[0],
          descripcion: agreement.descripcion || '',
          nuevaFechaVencimiento: '',
        });
      } else if (type === 'renew') {
        setFormData({
          ...formData,
          nuevaFechaVencimiento: '',
        });
      }
    } else {
      setFormData({
        codigo: '',
        empresaId: '',
        fechaInicio: '',
        fechaVencimiento: '',
        descripcion: '',
        nuevaFechaVencimiento: '',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (modalType === 'create') {
        await createAgreement({
          codigo: formData.codigo,
          empresaId: parseInt(formData.empresaId),
          fechaInicio: formData.fechaInicio,
          fechaVencimiento: formData.fechaVencimiento,
          descripcion: formData.descripcion,
        });
        toast({ title: 'Éxito', description: 'Convenio creado exitosamente' });
      } else if (modalType === 'edit' && selectedAgreement) {
        await updateAgreement(selectedAgreement.id, {
          codigo: formData.codigo,
          empresaId: parseInt(formData.empresaId),
          fechaInicio: formData.fechaInicio,
          fechaVencimiento: formData.fechaVencimiento,
          descripcion: formData.descripcion,
        });
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
    if (!confirm('¿Estás seguro de que deseas eliminar este convenio?')) return;

    try {
      await deleteAgreement(id);
      toast({ title: 'Éxito', description: 'Convenio eliminado exitosamente' });
      loadData();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo eliminar el convenio',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'bg-emerald-500/10 text-emerald-700';
      case 'vencido':
        return 'bg-red-500/10 text-red-700';
      case 'renovado':
        return 'bg-blue-500/10 text-blue-700';
      case 'cancelado':
        return 'bg-gray-500/10 text-gray-700';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'vencido':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'renovado':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      case 'cancelado':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const isExpiringSoon = (fechaVencimiento: string) => {
    const vencimiento = new Date(fechaVencimiento);
    const hoy = new Date();
    const diffDays = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  const filteredAgreements = agreements.filter((agreement) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      agreement.codigo.toLowerCase().includes(searchLower) ||
      agreement.empresa.razonSocial.toLowerCase().includes(searchLower) ||
      agreement.empresa.ruc.toLowerCase().includes(searchLower)
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

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Vigentes', value: agreements.filter(a => a.estado === 'vigente').length, color: 'text-emerald-600' },
          { label: 'Vencidos', value: agreements.filter(a => a.estado === 'vencido').length, color: 'text-red-600' },
          { label: 'Renovados', value: agreements.filter(a => a.estado === 'renovado').length, color: 'text-blue-600' },
          { label: 'Por vencer', value: agreements.filter(a => a.estado === 'vigente' && isExpiringSoon(a.fechaVencimiento)).length, color: 'text-amber-600' },
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
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{agreement.codigo}</h3>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(agreement.estado)}`}>
                        {getStatusIcon(agreement.estado)}
                        {agreement.estado.charAt(0).toUpperCase() + agreement.estado.slice(1)}
                      </span>
                      {isExpiringSoon(agreement.fechaVencimiento) && agreement.estado === 'vigente' && (
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
                        {new Date(agreement.fechaInicio).toLocaleDateString('es-ES')} - {new Date(agreement.fechaVencimiento).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    {agreement.descripcion && (
                      <p className="text-sm text-muted-foreground mt-2">{agreement.descripcion}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(agreement.estado === 'vigente' || agreement.estado === 'vencido') && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openModal('renew', agreement)}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Renovar
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
                  </h3>
                  <button
                    onClick={() => resetForm()}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

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
                        Código del Convenio
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        placeholder="Ej: CONV-2024-001"
                        className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Empresa
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
                        Descripción (opcional)
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        placeholder="Detalles adicionales del convenio..."
                        rows={3}
                        className="w-full p-3 bg-background border border-border rounded-lg resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                      />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
