'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User as UserIcon, Mail, Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { 
  getUser, 
  updateUser, 
  getFullName, 
  rolSelectOptions, 
  rolColors,
  rolLabels,
  RolUsuario,
  type User,
  type UpdateUserData
} from '../../_lib/users';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

export default function EditUserPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = parseInt(params.id as string);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    rol: RolUsuario.ESTUDIANTE,
    contrasena: '',
    activo: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasLoadedRef = useState(false);

  useEffect(() => {
    if (hasLoadedRef[0] || !userId) return;
    
    const loadUser = async () => {
      try {
        const data = await getUser(userId);
        setUser(data);
        setFormData({
          email: data.email,
          nombre: data.nombre,
          apellidoPaterno: data.apellidoPaterno,
          apellidoMaterno: data.apellidoMaterno,
          rol: data.rol,
          contrasena: '',
          activo: data.activo,
        });
        hasLoadedRef[1](true);
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
        router.push('/dashboard/users');
      } finally {
        setIsLoadingUser(false);
      }
    };

    loadUser();
  }, [userId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo electrónico válido';
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
    
    if (formData.contrasena && formData.contrasena.length < 6) {
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
      const updateData: UpdateUserData = {
        email: formData.email.trim(),
        nombre: formData.nombre.trim(),
        apellidoPaterno: formData.apellidoPaterno.trim(),
        apellidoMaterno: formData.apellidoMaterno.trim(),
        activo: formData.activo,
      };
      
      if (formData.contrasena.trim()) {
        updateData.contrasenaHash = formData.contrasena.trim();
      }
      
      await updateUser(userId, updateData);
      
      toast({
        title: 'Éxito',
        description: 'Usuario actualizado exitosamente.',
      });
      
      router.push('/dashboard/users');
    } catch (err: any) {
      toast({
        title: 'Error al actualizar usuario',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-96 bg-muted rounded-xl animate-pulse" />
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
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm" className="border-border">
          <Link href="/dashboard/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editar Usuario</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {user && `Editando: ${getFullName(user)}`}
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        variants={itemVariants}
        onSubmit={handleSubmit}
        className="p-6 bg-card rounded-xl border border-border space-y-6"
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" /> Correo electrónico
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={`bg-background border-input ${errors.email ? 'border-red-500' : ''}`}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre" className="text-foreground flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> Nombre
          </Label>
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

        {/* Roles */}
        <div className="space-y-2">
          <Label className="text-foreground flex items-center gap-2">
            <Shield className="w-4 h-4" /> Roles
          </Label>
          <div className="flex flex-wrap gap-2">
            {user && user.roles && user.roles.length > 0 ? (
              user.roles.map((role, idx) => (
                <span 
                  key={idx} 
                  className={`px-3 py-1.5 text-sm rounded-full ${rolColors[role.nombre as RolUsuario]}`}
                >
                  {rolLabels[role.nombre as RolUsuario]}
                </span>
              ))
            ) : (
              <span className={`px-3 py-1.5 text-sm rounded-full ${rolColors[formData.rol]}`}>
                {rolLabels[formData.rol]}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Los roles no pueden modificarse al editar un usuario.</p>
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
          <p className="text-xs text-muted-foreground">Dejar en blanco para mantener la contraseña actual</p>
        </div>

        {/* Activo */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="activo" className="text-foreground">Usuario activo</Label>
            <p className="text-sm text-muted-foreground">Los usuarios inactivos no pueden iniciar sesión</p>
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> Guardar cambios
              </>
            )}
          </Button>
        </div>
      </motion.form>
    </motion.div>
  );
}
