'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, GraduationCap, Eye, EyeOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { UserProfileSelector } from '@/components/user-profile-selector';

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
}

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

export default function NewStudentPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromCoordinator = searchParams.get('from') === 'coordinator';
  const backUrl = fromCoordinator ? '/dashboard/coordinator' : '/dashboard/users/new/select-type';
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoadingCareers, setIsLoadingCareers] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    codigoUniversitario: string;
    escuelaProfesional: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    // Datos personales
    emailRecuperacion: '',  // Email personal para recuperación (obligatorio)
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    contrasena: '',
    
    // Datos académicos
    carreraId: '',
    anioIngreso: new Date().getFullYear().toString(),
    
    // Estado
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar carreras desde la API
  useEffect(() => {
    const loadCareers = async () => {
      setIsLoadingCareers(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/careers/list`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        if (response.ok) {
          const careersData = await response.json();
          setCareers(careersData);
        } else {
          // Fallback a datos mock si hay error
          setCareers([
            { id: 1, nombre: 'Ingeniería de Sistemas' },
            { id: 2, nombre: 'Ingeniería Civil' },
            { id: 3, nombre: 'Ingeniería Electrónica' },
            { id: 4, nombre: 'Administración' },
          ]);
        }
      } catch (error) {
        console.error('Error loading careers:', error);
        // Fallback a datos mock si hay error
        setCareers([
          { id: 1, nombre: 'Ingeniería de Sistemas' },
          { id: 2, nombre: 'Ingeniería Civil' },
          { id: 3, nombre: 'Ingeniería Electrónica' },
          { id: 4, nombre: 'Administración' },
        ]);
      } finally {
        setIsLoadingCareers(false);
      }
    };

    loadCareers();
  }, []);

  const generateCodigoUniversitario = (carreraId: string, anioIngreso: string): string => {
    const career = careers.find(c => c.id.toString() === carreraId);
    const careerCode = career ? career.nombre.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') : 'UNK';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${anioIngreso}${careerCode}${random}`;
  };

  const getEscuelaProfesional = (carreraId: string): string => {
    const career = careers.find(c => c.id.toString() === carreraId);
    return career ? `Escuela de ${career.nombre}` : 'Por asignar';
  };

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
    
    if (!formData.carreraId) {
      newErrors.carreraId = 'La carrera es requerida';
    }
    
    if (!formData.anioIngreso) {
      newErrors.anioIngreso = 'El año de ingreso es requerido';
    } else {
      const year = parseInt(formData.anioIngreso);
      const currentYear = new Date().getFullYear();
      if (year < 1990 || year > currentYear + 1) {
        newErrors.anioIngreso = 'Año de ingreso inválido';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Generar datos automáticos
      const codigoUniversitario = generateCodigoUniversitario(formData.carreraId, formData.anioIngreso);
      const escuelaProfesional = getEscuelaProfesional(formData.carreraId);
      
      setGeneratedData({ codigoUniversitario, escuelaProfesional });
      
      // Llamada real a la API del backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          emailRecuperacion: formData.emailRecuperacion,  // Email personal para recuperación
          nombre: formData.nombre,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          contrasena: formData.contrasena,
          carreraId: parseInt(formData.carreraId),
          anioIngreso: parseInt(formData.anioIngreso),
          activo: formData.activo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el estudiante');
      }

      const result = await response.json();
      
      const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;
      
      toast({
        title: '✅ Estudiante creado exitosamente',
        description: (
          <div className="space-y-2">
            <p><strong>{fullName}</strong> ha sido registrado como estudiante.</p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">Datos generados automáticamente:</p>
              <p>• Código Universitario: <strong>{result.codigoUniversitario || codigoUniversitario}</strong></p>
              <p>• Escuela Profesional: <strong>{result.escuelaProfesional || escuelaProfesional}</strong></p>
              <p>• Email Institucional: <strong>{result.user?.email || `${codigoUniversitario.toLowerCase()}@estudiante.unt.edu.pe`}</strong></p>
            </div>
            <p className="text-xs text-muted-foreground">Se han enviado las credenciales al email de recuperación.</p>
          </div>
        ) as any,
      });
      
      router.push('/dashboard/users');
    } catch (err: any) {
      console.error('Error creating student:', err);
      toast({
        title: 'Error al crear estudiante',
        description: err.message || 'No se pudo crear el estudiante. Intente nuevamente.',
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
          <h1 className="text-2xl font-bold text-foreground">Crear Estudiante</h1>
          <p className="text-muted-foreground text-sm mt-1">Perfil automático con código universitario generado</p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div 
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Flujo Automatizado para Estudiantes</p>
            <p>El sistema generará automáticamente el código universitario y asignará la escuela profesional según la carrera seleccionada. El estudiante podrá iniciar sesión inmediatamente.</p>
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
                    {`${generate10CharUsername(formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno)}@estudiante.com`}
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
              placeholder="Juan"
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
                placeholder="Pérez"
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
                placeholder="García"
                value={formData.apellidoMaterno}
                onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                className={`bg-background border-input ${errors.apellidoMaterno ? 'border-red-500' : ''}`}
              />
              {errors.apellidoMaterno && <p className="text-sm text-red-500">{errors.apellidoMaterno}</p>}
            </div>
          </div>
        </div>

        {/* Datos Académicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Datos Académicos
          </h3>
          
          {/* Carrera */}
          <div className="space-y-2">
            <Label htmlFor="carreraId" className="text-foreground">Carrera</Label>
            <Select value={formData.carreraId} onValueChange={(value: string) => setFormData({ ...formData, carreraId: value })}>
              <SelectTrigger className={`bg-background border-input ${errors.carreraId ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Selecciona una carrera" />
              </SelectTrigger>
              <SelectContent>
                {careers.map((career) => (
                  <SelectItem key={career.id} value={career.id.toString()}>
                    {career.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.carreraId && <p className="text-sm text-red-500">{errors.carreraId}</p>}
          </div>

          {/* Año de Ingreso */}
          <div className="space-y-2">
            <Label htmlFor="anioIngreso" className="text-foreground">Año de ingreso</Label>
            <Input
              id="anioIngreso"
              type="number"
              min="1990"
              max={new Date().getFullYear() + 1}
              value={formData.anioIngreso}
              onChange={(e) => setFormData({ ...formData, anioIngreso: e.target.value })}
              className={`bg-background border-input ${errors.anioIngreso ? 'border-red-500' : ''}`}
            />
            {errors.anioIngreso && <p className="text-sm text-red-500">{errors.anioIngreso}</p>}
          </div>

          {/* Preview de datos generados */}
          {formData.carreraId && formData.anioIngreso && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-medium text-green-800 dark:text-green-200">Datos que se generarán automáticamente:</p>
                  <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                    <p>• <strong>Código Universitario:</strong> {generateCodigoUniversitario(formData.carreraId, formData.anioIngreso)}</p>
                    <p>• <strong>Escuela Profesional:</strong> {getEscuelaProfesional(formData.carreraId)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
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
            <Label htmlFor="activo" className="text-foreground">Estudiante activo</Label>
            <p className="text-sm text-muted-foreground">Los estudiantes inactivos no pueden postular a prácticas</p>
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
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Crear Estudiante
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
