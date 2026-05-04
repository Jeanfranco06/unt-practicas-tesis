'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, UserCog, Eye, EyeOff, CheckCircle2, Building2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { trpc } from '@/lib/trpc';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

interface Career {
  id: number;
  nombre: string;
  codigo: string;
}

const categories = [
  'Auxiliar',
  'Asistente',
  'Asociado',
  'Principal'
];

const dedications = [
  'Tiempo Completo',
  'Medio Tiempo',
  'Tiempo Parcial'
];

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

export default function NewTeacherPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCoordinator = searchParams.get('from') === 'coordinator';
  const backUrl = fromCoordinator ? '/dashboard/coordinator' : '/dashboard/users/new/select-type';
  
  const trpcAny = trpc as any;

  const careersQuery = trpcAny.academic.careers.list.useQuery();
  const careers = (careersQuery.data ?? []) as Career[];

  const [selectedCareerDisplay, setSelectedCareerDisplay] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Datos personales
    emailRecuperacion: '',  // Email personal para recuperación (obligatorio)
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    contrasena: '',
    
    // Datos académicos
    carreraId: '',
    especialidad: '',
    categoria: '',
    dedicacion: '',
    oficina: '',
    telefono: '',
    
    // Roles
    roles: {
      asesor: false,
      coordinador: false,
    },
    
    // Estado
    activo: true,
  });

  useEffect(() => {
    if (!careersQuery.data) return;

    // Si ya hay carrera seleccionada por id, sincronizar label
    if (formData.carreraId) {
      const found = careers.find((c) => c.id.toString() === formData.carreraId);
      setSelectedCareerDisplay(found?.nombre ?? formData.carreraId);
      return;
    }

    // Caso: BD con 1 sola carrera -> autoseleccionar
    if (careers.length === 1) {
      const only = careers[0];
      setFormData((prev) => ({ ...prev, carreraId: only.id.toString() }));
      setSelectedCareerDisplay(only.nombre);
    }
  }, [careersQuery.data, careers, formData.carreraId]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Validation helper functions
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    if (!phone) return true; // Optional
    // Allow formats: 123456789, 123-456-789, etc. (max 9 characters)
    return /^[\d\s\-\+\(\)]{0,9}$/.test(phone);
  };

  const validateField = (name: string, value: any, allData: typeof formData): string => {
    switch (name) {
      case 'emailRecuperacion':
        if (!value?.trim()) return 'El email de recuperación es requerido';
        if (!validateEmail(value)) return 'Ingresa un correo electrónico válido (ej: usuario@ejemplo.com)';
        return '';
      case 'nombre':
        if (!value?.trim()) return 'El nombre es requerido';
        if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.trim().length > 50) return 'El nombre no puede tener más de 50 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El nombre solo puede contener letras y espacios';
        return '';
      case 'apellidoPaterno':
        if (!value?.trim()) return 'El apellido paterno es requerido';
        if (value.trim().length < 2) return 'El apellido paterno debe tener al menos 2 caracteres';
        if (value.trim().length > 50) return 'El apellido paterno no puede tener más de 50 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido solo puede contener letras y espacios';
        return '';
      case 'apellidoMaterno':
        if (!value?.trim()) return 'El apellido materno es requerido';
        if (value.trim().length < 2) return 'El apellido materno debe tener al menos 2 caracteres';
        if (value.trim().length > 50) return 'El apellido materno no puede tener más de 50 caracteres';
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) return 'El apellido solo puede contener letras y espacios';
        return '';
      case 'contrasena':
        if (!value?.trim()) return 'La contraseña es requerida';
        if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
        if (value.length > 50) return 'La contraseña no puede tener más de 50 caracteres';
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) return 'La contraseña debe contener al menos una letra y un número';
        return '';
      case 'carreraId':
        if (!value) return 'La carrera es requerida';
        return '';
      case 'especialidad':
        if (value && value.length > 200) return 'La especialidad no puede tener más de 200 caracteres';
        return '';
      case 'oficina':
        if (value && value.length > 50) return 'La oficina no puede tener más de 50 caracteres';
        return '';
      case 'telefono':
        if (value && value.length > 9) return 'El teléfono no puede tener más de 9 caracteres';
        if (value && !validatePhone(value)) return 'Ingrese un número de teléfono válido (máx. 9 caracteres)';
        return '';
      case 'roles':
        if (!allData.roles || (!allData.roles.asesor && !allData.roles.coordinador)) {
          return 'Debe seleccionar al menos un rol (ASESOR o COORDINADOR)';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate = ['emailRecuperacion', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'contrasena', 'carreraId', 'especialidad', 'oficina', 'telefono', 'roles'];
    
    fieldsToValidate.forEach((field) => {
      const value = formData[field as keyof typeof formData];
      const error = validateField(field, value, formData);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    setFormData({ ...formData, [field]: value });
    setTouched({ ...touched, [field]: true });
    
    // Real-time validation
    const error = validateField(field, value, { ...formData, [field]: value });
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });
    const value = formData[field];
    const error = validateField(field, value, formData);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleRoleChange = (role: 'asesor' | 'coordinador', checked: boolean) => {
    const newRoles = { ...formData.roles, [role]: checked };
    setFormData({ ...formData, roles: newRoles });
    
    // Validate roles
    setTouched({ ...touched, roles: true });
    const rolesError = validateField('roles', null, { ...formData, roles: newRoles });
    setErrors((prev) => ({ ...prev, roles: rolesError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    const allFields = ['emailRecuperacion', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'contrasena', 'carreraId', 'especialidad', 'oficina', 'telefono', 'roles'];
    allFields.forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Llamada real a la API del backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/teacher`, {
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
          carreraId: parseInt(formData.carreraId),
          especialidad: formData.especialidad,
          categoria: formData.categoria,
          dedicacion: formData.dedicacion,
          oficina: formData.oficina,
          telefono: formData.telefono,
          roles: {
            asesor: formData.roles.asesor,
            coordinador: formData.roles.coordinador,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el docente');
      }

      const result = await response.json();
      
      const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;
      const selectedRoles = [];
      if (formData.roles.asesor) selectedRoles.push('ASESOR');
      if (formData.roles.coordinador) selectedRoles.push('COORDINADOR');
      
      // Email generado por el backend
      const generatedEmail = result.user?.email || `${formData.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')}.${formData.apellidoPaterno.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '')}@unt.edu.pe`;
      
      toast({
        title: '✅ Docente creado exitosamente',
        description: (
          <div className="space-y-2">
            <p><strong>{fullName}</strong> ha sido registrado como docente.</p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">Datos generados:</p>
              <p>• Email Institucional: <strong>{generatedEmail}</strong></p>
              <p>• Roles: {selectedRoles.join(' y ')}</p>
              <p>• Carrera: {careers.find(c => c.id.toString() === formData.carreraId)?.nombre ?? '—'}</p>
              {formData.especialidad && <p>• Especialidad: {formData.especialidad}</p>}
            </div>
            <p className="text-xs text-muted-foreground">Se han enviado las credenciales al email de recuperación.</p>
          </div>
        ) as any,
      });
      
      router.push('/dashboard/users');
    } catch (err: any) {
      toast({
        title: 'Error al crear docente',
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
          <Link href={backUrl}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crear Docente (Asesor/Coordinador)</h1>
          <p className="text-muted-foreground text-sm mt-1">Solo requiere rol asignado, sin perfil adicional</p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div 
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <UserCog className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Flujo Simplificado para Docentes</p>
            <p>Los docentes solo requieren la asignación de roles específicos (ASESOR y/o COORDINADOR). No necesitan perfiles adicionales. Un docente puede tener ambos roles simultáneamente.</p>
          </div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="p-6 bg-card rounded-xl border border-border space-y-6"
      >
        {/* Datos Personales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <User className="w-5 h-5" />
            Datos Personales
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
              onChange={(e) => handleFieldChange('emailRecuperacion', e.target.value)}
              onBlur={() => handleBlur('emailRecuperacion')}
              className={`bg-background ${errors.emailRecuperacion && touched.emailRecuperacion ? 'border-red-500' : 'border-input'}`}
            />
            {errors.emailRecuperacion && touched.emailRecuperacion && <p className="text-sm text-red-500">{errors.emailRecuperacion}</p>}
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
                    {`${generate10CharUsername(formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno)}@docente.com`}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Este email se usará para iniciar sesión en el sistema</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">Nombre <span className="text-red-500">*</span></Label>
            <Input
              id="nombre"
              placeholder="Carlos"
              value={formData.nombre}
              onChange={(e) => handleFieldChange('nombre', e.target.value)}
              onBlur={() => handleBlur('nombre')}
              className={`bg-background ${errors.nombre && touched.nombre ? 'border-red-500' : 'border-input'}`}
            />
            {errors.nombre && touched.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
          </div>

          {/* Apellidos */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="apellidoPaterno" className="text-foreground">Apellido paterno <span className="text-red-500">*</span></Label>
              <Input
                id="apellidoPaterno"
                placeholder="Rodríguez"
                value={formData.apellidoPaterno}
                onChange={(e) => handleFieldChange('apellidoPaterno', e.target.value)}
                onBlur={() => handleBlur('apellidoPaterno')}
                className={`bg-background ${errors.apellidoPaterno && touched.apellidoPaterno ? 'border-red-500' : 'border-input'}`}
              />
              {errors.apellidoPaterno && touched.apellidoPaterno && <p className="text-sm text-red-500">{errors.apellidoPaterno}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno" className="text-foreground">Apellido materno <span className="text-red-500">*</span></Label>
              <Input
                id="apellidoMaterno"
                placeholder="López"
                value={formData.apellidoMaterno}
                onChange={(e) => handleFieldChange('apellidoMaterno', e.target.value)}
                onBlur={() => handleBlur('apellidoMaterno')}
                className={`bg-background ${errors.apellidoMaterno && touched.apellidoMaterno ? 'border-red-500' : 'border-input'}`}
              />
              {errors.apellidoMaterno && touched.apellidoMaterno && <p className="text-sm text-red-500">{errors.apellidoMaterno}</p>}
            </div>
          </div>
        </div>

        {/* Datos Académicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Datos Académicos
          </h3>
          
          {/* Carrera */}
          <div className="space-y-2">
            <Label htmlFor="carreraId" className="text-foreground">Carrera <span className="text-red-500">*</span></Label>
            <Select
              value={selectedCareerDisplay}
              onValueChange={(careerIdStr: string) => {
                handleFieldChange('carreraId', careerIdStr);
                const found = careers.find((c) => c.id.toString() === careerIdStr);
                setSelectedCareerDisplay(found?.nombre ?? careerIdStr);
              }}
            >
              <SelectTrigger className={`bg-background ${errors.carreraId && touched.carreraId ? 'border-red-500' : 'border-input'}`}>
                <SelectValue placeholder="Selecciona una carrera" />
              </SelectTrigger>
              <SelectContent>
                {careersQuery.isLoading
                  ? null
                  : careers.map((career) => (
                      <SelectItem key={career.id} value={career.id.toString()}>
                        {career.nombre} ({career.codigo})
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
            {errors.carreraId && touched.carreraId && <p className="text-sm text-red-500">{errors.carreraId}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Especialidad */}
            <div className="space-y-2">
              <Label htmlFor="especialidad" className="text-foreground">Especialidad (opcional)</Label>
              <Input
                id="especialidad"
                placeholder="Software, Redes, etc."
                value={formData.especialidad}
                onChange={(e) => handleFieldChange('especialidad', e.target.value)}
                onBlur={() => handleBlur('especialidad')}
                className={`bg-background ${errors.especialidad && touched.especialidad ? 'border-red-500' : 'border-input'}`}
              />
              {errors.especialidad && touched.especialidad && <p className="text-sm text-red-500">{errors.especialidad}</p>}
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="categoria" className="text-foreground">Categoría (opcional)</Label>
              <Select value={formData.categoria} onValueChange={(value: string) => setFormData({ ...formData, categoria: value })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecciona categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {/* Dedicación */}
            <div className="space-y-2">
              <Label htmlFor="dedicacion" className="text-foreground">Dedicación (opcional)</Label>
              <Select value={formData.dedicacion} onValueChange={(value: string) => setFormData({ ...formData, dedicacion: value })}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {dedications.map((dedication) => (
                    <SelectItem key={dedication} value={dedication}>
                      {dedication}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Oficina */}
            <div className="space-y-2">
              <Label htmlFor="oficina" className="text-foreground">Oficina (opcional)</Label>
              <Input
                id="oficina"
                placeholder="A-201"
                value={formData.oficina}
                onChange={(e) => handleFieldChange('oficina', e.target.value)}
                onBlur={() => handleBlur('oficina')}
                className={`bg-background ${errors.oficina && touched.oficina ? 'border-red-500' : 'border-input'}`}
              />
              {errors.oficina && touched.oficina && <p className="text-sm text-red-500">{errors.oficina}</p>}
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono" className="text-foreground flex items-center gap-2">
                <Phone className="w-4 h-4" /> Teléfono (opcional)
              </Label>
              <Input
                id="telefono"
                placeholder="123456789"
                maxLength={9}
                value={formData.telefono}
                onChange={(e) => handleFieldChange('telefono', e.target.value)}
                onBlur={() => handleBlur('telefono')}
                className={`bg-background ${errors.telefono && touched.telefono ? 'border-red-500' : 'border-input'}`}
              />
              {errors.telefono && touched.telefono && <p className="text-sm text-red-500">{errors.telefono}</p>}
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserCog className="w-5 h-5" />
            Roles a Asignar
          </h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="rol-asesor"
                  checked={formData.roles.asesor}
                  onCheckedChange={(checked: boolean) => handleRoleChange('asesor', checked)}
                />
                <div className="flex-1">
                  <Label htmlFor="rol-asesor" className="text-foreground font-medium cursor-pointer">
                    ASESOR
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Podrá supervisar prácticas, evaluar informes y asesorar tesis
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="rol-coordinador"
                  checked={formData.roles.coordinador}
                  onCheckedChange={(checked: boolean) => handleRoleChange('coordinador', checked)}
                  disabled={fromCoordinator}
                />
                <div className="flex-1">
                  <Label htmlFor="rol-coordinador" className={`text-foreground font-medium cursor-pointer ${fromCoordinator ? 'opacity-50' : ''}`}>
                    COORDINADOR
                  </Label>
                  <p className={`text-sm mt-1 ${fromCoordinator ? 'text-muted-foreground opacity-50' : 'text-muted-foreground'}`}>
                    {fromCoordinator 
                      ? 'Solo administradores pueden crear otros coordinadores' 
                      : 'Podrá gestionar estudiantes, aprobar registros y generar reportes de su facultad'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {errors.roles && touched.roles && (
            <p className="text-sm text-red-500 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {errors.roles}
            </p>
          )}

          {/* Preview de roles seleccionados */}
          {(formData.roles.asesor || formData.roles.coordinador) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">Roles que se asignarán:</p>
                  <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                    {formData.roles.asesor && <span>• ASESOR</span>}
                    {formData.roles.coordinador && <span>{formData.roles.asesor && <br />}• COORDINADOR</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Contraseña */}
        <div className="space-y-2">
          <Label htmlFor="contrasena" className="text-foreground">Contraseña <span className="text-red-500">*</span></Label>
          <div className="relative">
            <Input
              id="contrasena"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.contrasena}
              onChange={(e) => handleFieldChange('contrasena', e.target.value)}
              onBlur={() => handleBlur('contrasena')}
              className={`bg-background pr-10 ${errors.contrasena && touched.contrasena ? 'border-red-500' : 'border-input'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.contrasena && touched.contrasena && <p className="text-sm text-red-500">{errors.contrasena}</p>}
          <p className="text-xs text-muted-foreground">Mínimo 6 caracteres, debe contener letras y números</p>
        </div>

        {/* Activo */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="activo" className="text-foreground">Docente activo</Label>
            <p className="text-sm text-muted-foreground">Los docentes inactivos no pueden acceder al sistema</p>
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
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Crear Docente
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
