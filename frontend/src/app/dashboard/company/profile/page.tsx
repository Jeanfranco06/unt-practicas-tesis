'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { API_URL, fetchWithAuth } from '../_lib/api';
import type { Company } from '../_lib/api';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function CompanyProfilePage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    const getEmpresaId = async () => {
      const storedEmpresaId = localStorage.getItem('empresaId');
      if (storedEmpresaId) {
        setEmpresaId(storedEmpresaId);
        return;
      }
      if (user?.sub) {
        try {
          const data = await fetchWithAuth(`${API_URL}/api/company-representatives/user/${user.sub}`);
          if (data?.empresaId) {
            const newEmpresaId = data.empresaId.toString();
            setEmpresaId(newEmpresaId);
            localStorage.setItem('empresaId', newEmpresaId);
          }
        } catch (err) {
          console.error('Error al obtener empresaId:', err);
        }
      }
      if (!empresaId) setIsLoading(false);
    };
    if (isAuthenticated) {
      getEmpresaId();
    }
  }, [user, isAuthenticated]);

  const loadCompany = async () => {
    if (!empresaId) return;
    try {
      setIsLoading(true);
      const data = await fetchWithAuth(`${API_URL}/api/companies/${empresaId}`);
      setCompany(data);
      setFormData(data);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo cargar la información de la empresa',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (empresaId) {
      loadCompany();
    }
  }, [empresaId]);

  const handleSave = async () => {
    if (!empresaId || !formData) return;
    try {
      await fetchWithAuth(`${API_URL}/api/companies/${empresaId}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
      });
      toast({
        title: 'Éxito',
        description: 'La información de la empresa fue actualizada correctamente.',
        variant: 'default',
      });
      setIsEditing(false);
      loadCompany();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'No se pudo actualizar la información',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    setFormData(company || {});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>No se encontró información de la empresa</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mi Empresa</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gestiona la información de tu empresa
          </p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-primary hover:bg-primary/90 text-white"
          >
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="border-border text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4 mr-2" /> Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Save className="h-4 w-4 mr-2" /> Guardar
            </Button>
          </div>
        )}
      </motion.div>

      {/* Company Info Card */}
      <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-4 bg-primary/20 rounded-xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Razón Social</label>
                  <Input
                    value={formData.razonSocial || ''}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre Comercial</label>
                  <Input
                    value={formData.nombreComercial || ''}
                    onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-foreground">{company.razonSocial}</h2>
                {company.nombreComercial && (
                  <p className="text-muted-foreground">{company.nombreComercial}</p>
                )}
              </>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                RUC: {company.ruc}
              </span>
              <span className={`px-2 py-1 rounded text-xs ${
                company.activo 
                  ? 'bg-emerald-500/20 text-emerald-600' 
                  : 'bg-slate-500/20 text-slate-600'
              }`}>
                {company.activo ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
              Información de Contacto
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Email de Contacto</p>
                  {isEditing ? (
                    <Input
                      value={formData.emailContacto || ''}
                      onChange={(e) => setFormData({ ...formData, emailContacto: e.target.value })}
                      className="mt-1"
                      type="email"
                    />
                  ) : (
                    <p className="text-foreground">{company.emailContacto || 'No especificado'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  {isEditing ? (
                    <Input
                      value={formData.telefono || ''}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-foreground">{company.telefono || 'No especificado'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Dirección</p>
                  {isEditing ? (
                    <Input
                      value={formData.direccion || ''}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-foreground">{company.direccion || 'No especificada'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Info Note */}
      <motion.div variants={itemVariants} className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="p-1 bg-blue-500/20 rounded">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Información importante</h4>
            <p className="text-sm text-muted-foreground mt-1">
              La información de tu empresa es visible para los estudiantes que postulan a tus ofertas de prácticas. 
              Mantén esta información actualizada para generar confianza con los candidatos.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
