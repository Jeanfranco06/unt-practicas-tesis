'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, AlertCircle, RefreshCw } from 'lucide-react';
import type { StudentFormData, Student } from '../_lib/students';
import { API_URL, fetchWithAuth, normalizeStudentFormData } from '../_lib/students';

// Función para generar código universitario automáticamente
function generateCodigoUniversitario(escuelaProfesional: string, anioIngreso: number | ''): string {
  if (!escuelaProfesional || !anioIngreso) return '';
  
  // Generar código basado en escuela y año + número aleatorio
  const escuelaCode = escuelaProfesional
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 3);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${anioIngreso}${escuelaCode}${random}`;
}

interface User {
  id: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  email: string;
  rol: string;
}

interface StudentFormProps {
  initialData?: Student | null;
  submitLabel: string;
  title: string;
  onCancel: () => void;
  onSubmit: (data: ReturnType<typeof normalizeStudentFormData>) => Promise<void> | void;
}

// Validation helper functions
const validateEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateUrl = (url: string): boolean => {
  if (!url) return true; // Optional field
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface Career {
  id: number;
  nombre: string;
}

export function StudentForm({ initialData, submitLabel, title, onCancel, onSubmit }: StudentFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    usuarioId: '',
    carreraId: '',
    codigoUniversitario: '',
    anioIngreso: new Date().getFullYear(),
    escuelaProfesional: '',
    expedienteAcademicoUrl: '',
    promedioGeneral: '',
    creditosAprobados: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargar usuarios disponibles y carreras
        const [usersData, careersData] = await Promise.all([
          fetchWithAuth(`${API_URL}/api/users/available/student?search=`),
          fetchWithAuth(`${API_URL}/api/users/careers/list`)
        ]);
        
        let availableUsers = Array.isArray(usersData) ? usersData.filter((u: User) =>
          u.rol !== 'ESTUDIANTE' && u.rol !== 'estudiante'
        ) : [];
        
        // If editing, add the current student's user to the list
        if (initialData?.usuario) {
          const currentUserExists = availableUsers.some((u: User) => u.id === initialData.usuario!.id);
          if (!currentUserExists) {
            availableUsers = [...availableUsers, initialData.usuario];
          }
        }
        
        setUsers(availableUsers);
        setCareers(Array.isArray(careersData) ? careersData : []);
        setUsersError(null);

        if (!initialData) {
          setFormData((current) => ({
            ...current,
            usuarioId: current.usuarioId || (availableUsers.length > 0 ? availableUsers[0].id : ''),
            carreraId: current.carreraId || (careersData.length > 0 ? careersData[0].id : ''),
          }));
        }
      } catch (err: any) {
        setUsersError(err.message || 'Error al cargar datos');
      }
    };

    loadData();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        usuarioId: initialData.usuarioId || '',
        carreraId: (initialData as any).carreraId || '',
        codigoUniversitario: initialData.codigoUniversitario || '',
        anioIngreso: initialData.anioIngreso || new Date().getFullYear(),
        escuelaProfesional: initialData.escuelaProfesional || '',
        expedienteAcademicoUrl: initialData.expedienteAcademicoUrl || '',
        promedioGeneral: initialData.promedioGeneral ?? '',
        creditosAprobados: initialData.creditosAprobados || 0,
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'usuarioId':
        if (!value) return 'Debe seleccionar un usuario';
        return '';
      case 'carreraId':
        if (!value) return 'Debe seleccionar una carrera';
        return '';
      case 'codigoUniversitario':
        if (!value?.trim()) return 'El código universitario es requerido';
        if (value.trim().length < 8) return 'El código debe tener al menos 8 caracteres';
        if (value.trim().length > 20) return 'El código no puede tener más de 20 caracteres';
        return '';
      case 'anioIngreso':
        if (!value) return 'El año de ingreso es requerido';
        if (value < 1900) return 'El año debe ser mayor o igual a 1900';
        if (value > new Date().getFullYear() + 1) return `El año no puede ser mayor a ${new Date().getFullYear() + 1}`;
        return '';
      case 'escuelaProfesional':
        if (!value?.trim()) return 'La escuela profesional es requerida';
        if (value.trim().length < 3) return 'La escuela profesional debe tener al menos 3 caracteres';
        return '';
      case 'expedienteAcademicoUrl':
        if (value && !validateUrl(value)) return 'Ingrese una URL válida (ej: https://ejemplo.com)';
        return '';
      case 'promedioGeneral':
        if (value !== '' && value !== null && value !== undefined) {
          const num = Number(value);
          if (isNaN(num)) return 'El promedio debe ser un número';
          if (num < 0) return 'El promedio no puede ser menor a 0';
          if (num > 20) return 'El promedio no puede ser mayor a 20';
        }
        return '';
      case 'creditosAprobados':
        if (value !== '' && value !== null && value !== undefined) {
          const num = Number(value);
          if (isNaN(num)) return 'Los créditos deben ser un número';
          if (num < 0) return 'Los créditos no pueden ser negativos';
        }
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const fieldsToValidate = ['usuarioId', 'carreraId', 'codigoUniversitario', 'anioIngreso', 'escuelaProfesional', 'expedienteAcademicoUrl', 'promedioGeneral', 'creditosAprobados'];
    
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field as keyof StudentFormData]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (field: keyof StudentFormData, value: any) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setTouched({ ...touched, [field]: true });
    
    // Real-time validation for touched fields
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));

    // Auto-generate código universitario when escuela or año changes
    if (field === 'escuelaProfesional' || field === 'anioIngreso') {
      const codigo = generateCodigoUniversitario(
        newFormData.escuelaProfesional,
        newFormData.anioIngreso
      );
      if (codigo && !formData.codigoUniversitario) {
        setFormData((prev) => ({ ...prev, codigoUniversitario: codigo }));
      }
    }
  };

  const regenerateCodigo = () => {
    const codigo = generateCodigoUniversitario(
      formData.escuelaProfesional,
      formData.anioIngreso
    );
    if (codigo) {
      setFormData({ ...formData, codigoUniversitario: codigo });
      setTouched({ ...touched, codigoUniversitario: true });
    }
  };

  const handleBlur = (field: keyof StudentFormData) => {
    setTouched({ ...touched, [field]: true });
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(normalizeStudentFormData(formData));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl shadow-sm overflow-hidden"
    >
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="usuarioId">Usuario <span className="text-red-500">*</span></Label>
          {users.length === 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    No hay usuarios disponibles para vincular como estudiante.
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Todos los usuarios existentes ya tienen un perfil de estudiante asignado, o no hay usuarios sin rol de estudiante.
                  </p>
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <Button asChild size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                      <Link href="/dashboard/users/new/student">
                        <Plus className="w-4 h-4 mr-1" />
                        Crear Estudiante (Flujo Automatizado)
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/dashboard/users/new/base">
                        Crear Usuario Base (sin rol)
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <select
              id="usuarioId"
              value={formData.usuarioId ? String(formData.usuarioId) : ''}
              onChange={(e) => handleFieldChange('usuarioId', Number(e.target.value))}
              onBlur={() => handleBlur('usuarioId')}
              className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.usuarioId && touched.usuarioId ? 'border-red-500' : 'border-border'
              }`}
              disabled={!!initialData}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} {user.apellidoPaterno} {user.apellidoMaterno} ({user.email})
                </option>
              ))}
            </select>
          )}
          {errors.usuarioId && touched.usuarioId && users.length > 0 && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.usuarioId}</p>
          )}
          {usersError && <p className="text-sm text-red-600 dark:text-red-400">{usersError}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="carreraId">Carrera <span className="text-red-500">*</span></Label>
          <select
            id="carreraId"
            value={formData.carreraId ? String(formData.carreraId) : ''}
            onChange={(e) => handleFieldChange('carreraId', Number(e.target.value))}
            onBlur={() => handleBlur('carreraId')}
            className={`flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              errors.carreraId && touched.carreraId ? 'border-red-500' : 'border-border'
            }`}
          >
            {careers.map((career) => (
              <option key={career.id} value={career.id}>
                {career.nombre}
              </option>
            ))}
          </select>
          {errors.carreraId && touched.carreraId && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.carreraId}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="codigoUniversitario">Código Universitario <span className="text-red-500">*</span></Label>
            <div className="flex gap-2">
              <Input
                id="codigoUniversitario"
                value={formData.codigoUniversitario}
                onChange={(e) => handleFieldChange('codigoUniversitario', e.target.value)}
                onBlur={() => handleBlur('codigoUniversitario')}
                className={`bg-background text-foreground flex-1 ${
                  errors.codigoUniversitario && touched.codigoUniversitario ? 'border-red-500' : 'border-border'
                }`}
                placeholder="Se genera automáticamente"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={regenerateCodigo}
                disabled={!formData.escuelaProfesional || !formData.anioIngreso}
                title="Generar código automático"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            {errors.codigoUniversitario && touched.codigoUniversitario && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.codigoUniversitario}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Se genera automáticamente: Año + Iniciales de Escuela + Número aleatorio
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="anioIngreso">Año de Ingreso <span className="text-red-500">*</span></Label>
            <Input
              id="anioIngreso"
              type="number"
              min={1900}
              max={new Date().getFullYear() + 1}
              value={formData.anioIngreso}
              onChange={(e) => handleFieldChange('anioIngreso', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('anioIngreso')}
              className={`bg-background text-foreground ${
                errors.anioIngreso && touched.anioIngreso ? 'border-red-500' : 'border-border'
              }`}
            />
            {errors.anioIngreso && touched.anioIngreso && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.anioIngreso}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="escuelaProfesional">Escuela Profesional <span className="text-red-500">*</span></Label>
          <Input
            id="escuelaProfesional"
            value={formData.escuelaProfesional}
            onChange={(e) => handleFieldChange('escuelaProfesional', e.target.value)}
            onBlur={() => handleBlur('escuelaProfesional')}
            className={`bg-background text-foreground ${
              errors.escuelaProfesional && touched.escuelaProfesional ? 'border-red-500' : 'border-border'
            }`}
            placeholder="Escuela de Ingeniería de Sistemas"
          />
          {errors.escuelaProfesional && touched.escuelaProfesional && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.escuelaProfesional}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="promedioGeneral">Promedio General (0-20)</Label>
            <Input
              id="promedioGeneral"
              type="number"
              min={0}
              max={20}
              step={0.01}
              value={formData.promedioGeneral}
              onChange={(e) => handleFieldChange('promedioGeneral', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('promedioGeneral')}
              className={`bg-background text-foreground ${
                errors.promedioGeneral && touched.promedioGeneral ? 'border-red-500' : 'border-border'
              }`}
              placeholder="15.50"
            />
            {errors.promedioGeneral && touched.promedioGeneral && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.promedioGeneral}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="creditosAprobados">Créditos Aprobados</Label>
            <Input
              id="creditosAprobados"
              type="number"
              min={0}
              value={formData.creditosAprobados}
              onChange={(e) => handleFieldChange('creditosAprobados', e.target.value === '' ? '' : Number(e.target.value))}
              onBlur={() => handleBlur('creditosAprobados')}
              className={`bg-background text-foreground ${
                errors.creditosAprobados && touched.creditosAprobados ? 'border-red-500' : 'border-border'
              }`}
              placeholder="120"
            />
            {errors.creditosAprobados && touched.creditosAprobados && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.creditosAprobados}</p>
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="expedienteAcademicoUrl">URL Expediente Académico (opcional)</Label>
          <Input
            id="expedienteAcademicoUrl"
            type="url"
            value={formData.expedienteAcademicoUrl}
            onChange={(e) => handleFieldChange('expedienteAcademicoUrl', e.target.value)}
            onBlur={() => handleBlur('expedienteAcademicoUrl')}
            className={`bg-background text-foreground ${
              errors.expedienteAcademicoUrl && touched.expedienteAcademicoUrl ? 'border-red-500' : 'border-border'
            }`}
            placeholder="https://ejemplo.com/expediente.pdf"
          />
          {errors.expedienteAcademicoUrl && touched.expedienteAcademicoUrl && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.expedienteAcademicoUrl}</p>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel} className="border-border text-foreground hover:bg-muted">
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600 text-white">
            {isSubmitting ? 'Guardando...' : submitLabel}
          </Button>
        </div>
      </form>
    </motion.section>
  );
}
