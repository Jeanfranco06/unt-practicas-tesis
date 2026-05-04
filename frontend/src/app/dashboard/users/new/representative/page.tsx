'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, Building2, Eye, EyeOff, CheckCircle2, AlertCircle, Search, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { API_URL, fetchWithAuth } from '@/app/dashboard/companies/_lib/companies';

function generate10CharUsername(nombre: string, apellidoPaterno: string, apellidoMaterno?: string, extraData?: string): string {
  const normalize = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  const cleanNombre = normalize(nombre);
  const cleanApellidoPaterno = normalize(apellidoPaterno);
  const cleanApellidoMaterno = apellidoMaterno ? normalize(apellidoMaterno) : '';

  // 1. First letter of first name
  let base = cleanNombre.charAt(0);

  // 2. Add as much of apellido paterno as possible
  const remainingAfterFirst = 9 - base.length;
  base += cleanApellidoPaterno.substring(0, remainingAfterFirst);

  // 3. If there's still space, add apellido materno
  if (base.length < 10) {
    const remainingAfterPaterno = 10 - base.length;
    base += cleanApellidoMaterno.substring(0, remainingAfterPaterno);
  }

  // 4. If we still need more characters, add random numbers
  if (base.length < 10) {
    const needed = 10 - base.length;
    const random = Math.floor(Math.random() * Math.pow(10, needed)).toString().padStart(needed, '0');
    base += random;
  }

  return base.substring(0, 10);
}

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
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
}

const departments = [
  'Recursos Humanos',
  'Sistemas',
  'Administración',
  'Producción',
  'Ventas',
  'Marketing',
  'Gerencia'
];

export default function NewRepresentativePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);

  // Misma fuente que /dashboard/companies: empresas activas (puede haber más de un representante por empresa)
  useEffect(() => {
    let isMounted = true;

    const fetchCompanies = async () => {
      try {
        setIsLoadingCompanies(true);
        const data = await fetchWithAuth(`${API_URL}/api/companies`);
        if (!isMounted) return;
        setCompanies(Array.isArray(data) ? data : []);
      } catch (error: unknown) {
        console.error('Error fetching companies:', error);
      } finally {
        if (isMounted) {
          setIsLoadingCompanies(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, []);
  const [formData, setFormData] = useState({
    // Datos personales
    emailRecuperacion: '',  // Email personal para recuperación (obligatorio)
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    contrasena: '',
    
    // Datos laborales
    empresaId: '',
    cargo: '',
    departamento: '',
    telefonoDirecto: '',
    esPrincipal: false,
    
    // Estado
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredCompanies = companies.filter((company) => {
    const q = searchTerm.toLowerCase();
    const nc = (company.nombreComercial ?? '').toLowerCase();
    return (
      company.razonSocial.toLowerCase().includes(q) ||
      company.ruc.includes(searchTerm) ||
      nc.includes(q)
    );
  });

  const selectedCompany = companies.find(c => c.id.toString() === formData.empresaId);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.emailRecuperacion.trim()) {
      newErrors.emailRecuperacion = 'El email de recuperación es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailRecuperacion)) {
      newErrors.emailRecuperacion = 'Ingresa un correo electrónico válido';
    }
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (!formData.apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    }
    
    if (!formData.apellidoMaterno.trim()) {
      newErrors.apellidoMaterno = 'El apellido materno es requerido';
    }
    
    if (!formData.contrasena.trim()) {
      newErrors.contrasena = 'La contraseña es requerida';
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.empresaId) {
      newErrors.empresaId = 'Debe seleccionar una empresa';
    }
    
    if (!formData.cargo.trim()) {
      newErrors.cargo = 'El cargo es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/representative`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          emailRecuperacion: formData.emailRecuperacion,
          nombre: formData.nombre,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          contrasena: formData.contrasena,
          empresaId: parseInt(formData.empresaId),
          cargo: formData.cargo,
          departamento: formData.departamento,
          telefonoDirecto: formData.telefonoDirecto,
          esPrincipal: formData.esPrincipal,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el representante');
      }

      const result = await response.json();
      const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;
      
      toast({
        title: '✅ Representante creado exitosamente',
        description: (
          <div className="space-y-2">
            <p><strong>{fullName}</strong> ha sido registrado como representante.</p>
            <div className="bg-cyan-50 dark:bg-cyan-950/20 p-3 rounded-lg text-sm">
              <p className="font-medium text-cyan-800 dark:text-cyan-200">Datos de vinculación:</p>
              <p>• Empresa: <strong>{selectedCompany?.razonSocial}</strong></p>
              <p>• Cargo: <strong>{formData.cargo}</strong></p>
              <p>• Representante Principal: <strong>{formData.esPrincipal ? 'Sí' : 'No'}</strong></p>
            </div>
            <p className="text-xs text-muted-foreground">Se han enviado las credenciales al email de recuperación.</p>
          </div>
        ) as any,
      });
      
      router.push('/dashboard/users');
    } catch (err: any) {
      toast({
        title: 'Error al crear representante',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="border-border">
          <Link href="/dashboard/users/new/select-type">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crear Representante de Empresa</h1>
          <p className="text-muted-foreground text-sm mt-1">Vincular a empresa existente</p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div 
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950/20 dark:to-blue-950/20 border border-cyan-200 dark:border-cyan-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Building2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Flujo con Empresa Existente</p>
            <p>Los representantes de empresa deben estar vinculados a una empresa existente en el sistema. Si la empresa no existe, primero créala en el módulo de Empresas.</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="p-6 bg-card rounded-xl border border-border space-y-6"
      >
        {/* Selección de Empresa */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Empresa Asociada
          </h3>
          
          {/* Búsqueda de empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa-search" className="text-foreground">Buscar empresa</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="empresa-search"
                type="search"
                placeholder="Buscar por RUC, razón social o nombre comercial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-input"
              />
            </div>
          </div>

          {/* Lista de empresas */}
          <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
            {isLoadingCompanies ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Cargando empresas...
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground text-sm">
                {companies.length === 0 ? (
                  <>
                    No hay empresas activas registradas. Crea una empresa primero.
                    <Link
                      href="/dashboard/companies/new"
                      target="_blank"
                      className="text-cyan-600 hover:text-cyan-700 underline ml-1"
                    >
                      Crear nueva empresa
                    </Link>
                  </>
                ) : (
                  'No se encontraron empresas con ese criterio de búsqueda.'
                )}
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div key={company.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                     onClick={() => setFormData({ ...formData, empresaId: company.id.toString() })}>
                  <input
                    type="radio"
                    name="empresa"
                    checked={formData.empresaId === company.id.toString()}
                    onChange={() => setFormData({ ...formData, empresaId: company.id.toString() })}
                    className="text-cyan-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{company.razonSocial}</p>
                    <p className="text-xs text-muted-foreground">
                      RUC: {company.ruc} • {company.nombreComercial ?? 'Sin nombre comercial'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {errors.empresaId && <p className="text-sm text-red-500">{errors.empresaId}</p>}

          {/* Enlace a crear empresa */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="text-sm">
              <p className="text-foreground font-medium">¿No encuentras la empresa?</p>
              <p className="text-muted-foreground">Crea una nueva empresa primero</p>
            </div>
            <Link 
              href="/dashboard/companies/new" 
              target="_blank"
              className="inline-flex items-center gap-1 text-sm font-medium text-cyan-600 hover:text-cyan-700"
            >
              <ExternalLink className="w-3 h-3" />
              Crear Empresa
            </Link>
          </div>

          {/* Preview de empresa seleccionada */}
          {selectedCompany && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Empresa seleccionada:</p>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                    <p>• <strong>{selectedCompany.razonSocial}</strong></p>
                    <p>• RUC: {selectedCompany.ruc}</p>
                    <p>• Nombre Comercial: {selectedCompany.nombreComercial ?? '—'}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Datos Personales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Datos Personales del Representante
          </h3>
          
          {/* Email de Recuperación */}
          <div className="space-y-2">
            <Label htmlFor="emailRecuperacion" className="text-foreground flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email de Recuperación <span className="text-red-500">*</span>
            </Label>
            <Input
              id="emailRecuperacion"
              type="email"
              placeholder="tu.email.personal@gmail.com"
              value={formData.emailRecuperacion}
              onChange={(e) => setFormData({ ...formData, emailRecuperacion: e.target.value })}
              className={`bg-background border-input ${errors.emailRecuperacion ? 'border-red-500' : ''}`}
            />
            {errors.emailRecuperacion && <p className="text-sm text-red-500">{errors.emailRecuperacion}</p>}
            <p className="text-xs text-muted-foreground">Este email se usará para recuperar la cuenta en caso de olvidar la contraseña</p>
          </div>

          {/* Preview del Email Institucional Generado */}
          {(formData.nombre || formData.apellidoPaterno) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Email institucional que se generará:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {`${generate10CharUsername(formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno, selectedCompany?.razonSocial)}@representante.com`}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Este email se usará para iniciar sesión en el sistema</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">Nombre</Label>
            <Input
              id="nombre"
              placeholder="Ana"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className={`bg-background border-input ${errors.nombre ? 'border-red-500' : ''}`}
            />
            {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Apellidos */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apellidoPaterno" className="text-foreground">Apellido paterno</Label>
              <Input
                id="apellidoPaterno"
                placeholder="Martínez"
                value={formData.apellidoPaterno}
                onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                className={`bg-background border-input ${errors.apellidoPaterno ? 'border-red-500' : ''}`}
              />
              {errors.apellidoPaterno && <p className="text-sm text-red-500">{errors.apellidoPaterno}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno" className="text-foreground">Apellido materno</Label>
              <Input
                id="apellidoMaterno"
                placeholder="Vargas"
                value={formData.apellidoMaterno}
                onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                className={`bg-background border-input ${errors.apellidoMaterno ? 'border-red-500' : ''}`}
              />
              {errors.apellidoMaterno && <p className="text-sm text-red-500">{errors.apellidoMaterno}</p>}
            </div>
          </div>
        </div>

        {/* Datos Laborales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos Laborales
          </h3>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo" className="text-foreground">Cargo *</Label>
              <Input
                id="cargo"
                placeholder="Gerente de RRHH"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                className={`bg-background border-input ${errors.cargo ? 'border-red-500' : ''}`}
              />
              {errors.cargo && <p className="text-sm text-red-500">{errors.cargo}</p>}
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-foreground">Departamento</Label>
              <Select value={formData.departamento} onValueChange={(value: string) => setFormData({ ...formData, departamento: value })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecciona departamento" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Teléfono Directo */}
          <div className="space-y-2">
            <Label htmlFor="telefonoDirecto" className="text-foreground">Teléfono Directo (opcional)</Label>
            <Input
              id="telefonoDirecto"
              placeholder="123-456-789"
              value={formData.telefonoDirecto}
              onChange={(e) => setFormData({ ...formData, telefonoDirecto: e.target.value })}
              className="bg-background border-input"
            />
          </div>

          {/* Es Principal */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div>
              <Label htmlFor="esPrincipal" className="text-foreground">Representante Principal</Label>
              <p className="text-sm text-muted-foreground">Será el contacto principal de la empresa</p>
            </div>
            <Switch
              id="esPrincipal"
              checked={formData.esPrincipal}
              onCheckedChange={(checked) => setFormData({ ...formData, esPrincipal: checked })}
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="contrasena" className="text-foreground">Contraseña</Label>
          <div className="relative">
            <Input
              id="contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={(e) => setFormData({ ...formData, contrasena: e.target.value })}
              className={`bg-background border-input pr-10 ${errors.contrasena ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.contrasena && <p className="text-sm text-red-500">{errors.contrasena}</p>}
          <p className="text-xs text-muted-foreground">Mínimo 6 caracteres</p>
        </div>

        {/* Activo */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="activo" className="text-foreground">Representante activo</Label>
            <p className="text-sm text-muted-foreground">Los representantes inactivos no pueden gestionar ofertas</p>
          </div>
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button asChild variant="outline" className="border-border">
            <Link href="/dashboard/users">Cancelar</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Crear Representante
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
