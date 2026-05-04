'use client';

import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Mail, Eye, EyeOff, AlertCircle, Info, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

function generate10CharUsername(nombre: string, apellidoPaterno: string, apellidoMaterno?: string): string {
  const normalize = (str: string) => str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');

  const cleanNombre = normalize(nombre);
  const cleanApellidoPaterno = normalize(apellidoPaterno);
  const cleanApellidoMaterno = apellidoMaterno ? normalize(apellidoMaterno) : '';

  let base = cleanNombre.charAt(0);
  const remainingAfterFirst = 9 - base.length;
  base += cleanApellidoPaterno.substring(0, remainingAfterFirst);

  if (base.length < 10) {
    const remainingAfterPaterno = 10 - base.length;
    base += cleanApellidoMaterno.substring(0, remainingAfterPaterno);
  }

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

export default function NewBaseUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    emailRecuperacion: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    contrasena: '',
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
    } else if (formData.contrasena.length < 6) {
      newErrors.contrasena = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/base`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear usuario');
      }

      const result = await response.json();
      const fullName = `${formData.nombre} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`;

      toast({
        title: '✅ Usuario creado exitosamente',
        description: (
          <div className="space-y-2">
            <p><strong>{fullName}</strong> ha sido registrado en el sistema.</p>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200">Datos generados automáticamente:</p>
              <p>• Email: <strong>{result.user?.email}</strong></p>
              <p>• Username: <strong>{result.user?.email?.split('@')[0]}</strong></p>
            </div>
            <p className="text-xs text-muted-foreground">
              Este usuario NO puede iniciar sesión hasta que se le asigne un rol.
              Usa &quot;Vincular a Perfil&quot; para asignarle Estudiante, Docente o Representante.
            </p>
          </div>
        ) as any,
      });

      router.push('/dashboard/users');
    } catch (err: any) {
      toast({
        title: 'Error al crear usuario',
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
          <h1 className="text-2xl font-bold text-foreground">Crear Usuario Base</h1>
          <p className="text-muted-foreground text-sm mt-1">Usuario sin rol - Requiere asignación posterior</p>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Usuario sin Rol Asignado</p>
            <p>Este usuario se creará sin ningún rol específico. No podrá acceder al sistema hasta que se le asigne un perfil:</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>• Estudiante - Acceso al portal de prácticas y tesis</li>
              <li>• Docente - Acceso como asesor o coordinador</li>
              <li>• Representante - Acceso a gestión de empresa</li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        variants={itemVariants}
        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-xl"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-200 mb-1">Acceso Restringido</p>
            <p className="text-amber-700 dark:text-amber-300">
              Los usuarios sin rol NO pueden iniciar sesión en el sistema.
              Después de crear este usuario, deberás asignarle un perfil para que pueda acceder.
            </p>
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

          {/* Preview del Email Generado */}
          {(formData.nombre || formData.apellidoPaterno) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Email que se generará:</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-mono bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                    {`${generate10CharUsername(formData.nombre, formData.apellidoPaterno, formData.apellidoMaterno)}@user.com`}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Este email se usará para iniciar sesión una vez tenga un rol asignado</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-foreground">Nombre <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="apellidoPaterno" className="text-foreground">Apellido paterno <span className="text-red-500">*</span></Label>
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
              <Label htmlFor="apellidoMaterno" className="text-foreground">Apellido materno <span className="text-red-500">*</span></Label>
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

        {/* Estado */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="activo" className="text-foreground">Usuario activo</Label>
            <p className="text-sm text-muted-foreground">Los usuarios inactivos no pueden acceder al sistema</p>
          </div>
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
          />
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

        {/* Info sobre siguiente paso */}
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-indigo-800 dark:text-indigo-200 mb-1">Próximo Paso: Asignar Rol</p>
              <p className="text-indigo-700 dark:text-indigo-300">
                Después de crear este usuario, podrás asignarle un perfil desde:
              </p>
              <ul className="mt-2 space-y-1 text-xs text-indigo-600 dark:text-indigo-400">
                <li>• /dashboard/students/new - Para vincular como estudiante</li>
                <li>• /dashboard/users/new/teacher - Para crear perfil de docente</li>
                <li>• /dashboard/users/new/representative - Para perfil de representante</li>
              </ul>
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
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Crear Usuario Base
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
