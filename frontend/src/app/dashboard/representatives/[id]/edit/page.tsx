'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertCircle, Building2, Briefcase, Phone, UserCheck, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import {
  getRepresentative,
  updateRepresentative,
  getCompanies,
  getFullName,
  type CompanyRepresentative,
  type Company,
  type RepresentativeFormData,
} from '../../_lib/representatives';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function EditRepresentativePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const representativeId = Number(params.id);

  const [representative, setRepresentative] = useState<CompanyRepresentative | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RepresentativeFormData>({
    empresaId: 0,
    cargo: '',
    departamento: '',
    telefonoDirecto: '',
    esPrincipal: false,
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [repData, companiesData] = await Promise.all([
          getRepresentative(representativeId),
          getCompanies(),
        ]);
        setRepresentative(repData);
        setCompanies(companiesData);
        setFormData({
          empresaId: repData.empresaId,
          cargo: repData.cargo || '',
          departamento: repData.departamento || '',
          telefonoDirecto: repData.telefonoDirecto || '',
          esPrincipal: repData.esPrincipal || false,
        });
        setError(null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [representativeId]);

  const handleChange = (field: keyof RepresentativeFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (!formData.empresaId || !formData.cargo.trim()) {
      setTouched({ empresaId: true, cargo: true });
      toast({
        title: 'Error',
        description: 'Complete los campos requeridos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      await updateRepresentative(representativeId, {
        empresaId: formData.empresaId,
        cargo: formData.cargo.trim(),
        departamento: formData.departamento?.trim() || undefined,
        telefonoDirecto: formData.telefonoDirecto?.trim() || undefined,
        esPrincipal: formData.esPrincipal,
      });
      toast({
        title: 'Éxito',
        description: 'Representante actualizado correctamente',
      });
      router.push('/dashboard/representatives');
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Error al guardar los cambios',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !representative) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Error al cargar el representante: {error || 'No encontrado'}</span>
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/representatives">Volver a la lista</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-6">
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
          <Link href="/dashboard/representatives">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Representantes
          </Link>
        </Button>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-amber-500" />
          Editar Representante
        </h1>
        <p className="text-muted-foreground mt-1">
          {getFullName(representative)} - {representative.usuario?.email}
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="space-y-6 bg-card rounded-xl border border-border p-6"
      >
        {/* Info del Usuario (Solo lectura) */}
        <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h3 className="font-medium text-foreground flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Información del Usuario
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre:</span>
              <p className="font-medium">{getFullName(representative)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <p className="font-medium">{representative.usuario?.email || 'N/A'}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Para cambiar los datos del usuario, ve a la{' '}
            <Link href="/dashboard/users" className="text-blue-600 dark:text-blue-400 hover:underline">
              gestión de usuarios
            </Link>
          </p>
        </div>

        {/* Empresa */}
        <div className="grid gap-2">
          <Label htmlFor="empresaId" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Empresa <span className="text-red-500">*</span>
          </Label>
          <select
            id="empresaId"
            value={formData.empresaId ? String(formData.empresaId) : ''}
            onChange={(e) => handleChange('empresaId', Number(e.target.value))}
            onBlur={() => handleBlur('empresaId')}
            className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              !formData.empresaId && touched.empresaId ? 'border-red-500' : 'border-border'
            }`}
          >
            <option value="">Seleccionar empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.razonSocial} (RUC: {company.ruc})
              </option>
            ))}
          </select>
          {!formData.empresaId && touched.empresaId && (
            <p className="text-sm text-red-600 dark:text-red-400">Debe seleccionar una empresa</p>
          )}
        </div>

        {/* Cargo y Departamento */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cargo" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Cargo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cargo"
              value={formData.cargo}
              onChange={(e) => handleChange('cargo', e.target.value)}
              onBlur={() => handleBlur('cargo')}
              placeholder="Ej: Gerente de RRHH"
              className={!formData.cargo.trim() && touched.cargo ? 'border-red-500' : ''}
            />
            {!formData.cargo.trim() && touched.cargo && (
              <p className="text-sm text-red-600 dark:text-red-400">El cargo es requerido</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="departamento" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Departamento
            </Label>
            <Input
              id="departamento"
              value={formData.departamento}
              onChange={(e) => handleChange('departamento', e.target.value)}
              placeholder="Ej: Recursos Humanos"
            />
          </div>
        </div>

        {/* Teléfono y Es Principal */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="telefonoDirecto" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Teléfono Directo
            </Label>
            <Input
              id="telefonoDirecto"
              value={formData.telefonoDirecto}
              onChange={(e) => handleChange('telefonoDirecto', e.target.value)}
              placeholder="Ej: 987654321"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="esPrincipal" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              Representante Principal
            </Label>
            <select
              id="esPrincipal"
              value={formData.esPrincipal ? 'true' : 'false'}
              onChange={(e) => handleChange('esPrincipal', e.target.value === 'true')}
              className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 pt-4 border-t border-border">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard/representatives">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Link>
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
