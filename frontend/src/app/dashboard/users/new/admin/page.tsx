'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, Shield, Eye, EyeOff, CheckCircle2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

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

export default function NewAdminPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    // Datos personales
    emailRecuperacion: '',  // Email personal para recuperación (obligatorio)
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    contrasena: '',
    
    // Estado
    activo: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    } else if (formData.contrasena.length < 8) {
      newErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.contrasena)) {
      newErrors.contrasena = 'La contraseña debe contener mayúsculas, minúsculas y números';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear administrador');
      }

      const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;
      
      toast({
        title: '✅ Administrador creado exitosamente',
        description: (
          <div className="space-y-2">
            <p><strong>{fullName}</strong> ha sido registrado como administrador.</p>
            <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg text-sm">
              <p className="font-medium text-purple-800 dark:text-purple-200">Permisos asignados:</p>
              <p>• Acceso total al sistema</p>
              <p>• Gestión de usuarios y roles</p>
              <p>• Configuración del sistema</p>
              <p>• Reportes avanzados</p>
            </div>
            <p className="text-xs text-muted-foreground">Se han enviado las credenciales al email de recuperación.</p>
          </div>
        ) as any,
      });
      
      router.push('/dashboard/users');
    } catch (err: any) {
      toast({
        title: 'Error al crear administrador',
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
          <h1 className="text-2xl font-bold text-foreground">Crear Administrador</h1>
          <p className="text-muted-foreground text-sm mt-1">Acceso total al sistema</p>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <motion.div 
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">⚠️ Acceso Restringido</p>
            <p>Solo los administradores existentes pueden crear nuevos administradores. Esta acción debe ser realizada con cuidado ya que otorga acceso completo al sistema.</p>
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
                    {`${generate10CharUsername(formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno)}@admin.com`}
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
              placeholder="Roberto"
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
                placeholder="Silva"
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
                placeholder="Díaz"
                value={formData.apellidoMaterno}
                onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                className={`bg-background border-input ${errors.apellidoMaterno ? 'border-red-500' : ''}`}
              />
              {errors.apellidoMaterno && <p className="text-sm text-red-500">{errors.apellidoMaterno}</p>}
            </div>
          </div>
        </div>

        {/* Permisos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Permisos del Administrador
          </h3>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-medium text-purple-800 dark:text-purple-200">Acceso Total al Sistema</p>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Gestión completa de usuarios y roles</li>
                  <li>• Configuración del sistema</li>
                  <li>• Acceso a todos los módulos y datos</li>
                  <li>• Generación de reportes avanzados</li>
                  <li>• Creación de otros administradores</li>
                  <li>• Auditoría y logs del sistema</li>
                </ul>
              </div>
            </div>
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
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Requisitos de contraseña:</p>
            <ul className="space-y-1 ml-2">
              <li>• Mínimo 8 caracteres</li>
              <li>• Al menos una mayúscula</li>
              <li>• Al menos una minúscula</li>
              <li>• Al menos un número</li>
            </ul>
          </div>
        </div>

        {/* Activo */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="activo" className="text-foreground">Administrador activo</Label>
            <p className="text-sm text-muted-foreground">Los administradores inactivos no pueden acceder al sistema</p>
          </div>
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
          />
        </div>

        {/* Confirmación Final */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Confirmación Requerida</p>
              <p className="text-amber-700 dark:text-amber-300">
                Estás a punto de crear un nuevo administrador con acceso completo al sistema. 
                Verifica que todos los datos sean correctos antes de continuar.
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 justify-end pt-4 border-t border-border">
          <Button asChild variant="outline" className="border-border">
            <Link href="/dashboard/users">Cancelar</Link>
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Crear Administrador
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
