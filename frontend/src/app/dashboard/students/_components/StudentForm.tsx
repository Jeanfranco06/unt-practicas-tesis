'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { StudentFormData, Student } from '../_lib/students';
import { API_URL, fetchWithAuth, normalizeStudentFormData } from '../_lib/students';

interface User {
  id: number;
  nombre: string;
  apellido: string;
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

export function StudentForm({ initialData, submitLabel, title, onCancel, onSubmit }: StudentFormProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [formData, setFormData] = useState<StudentFormData>({
    usuarioId: '',
    codigoUniversitario: '',
    anioIngreso: new Date().getFullYear(),
    escuelaProfesional: '',
    expedienteAcademicoUrl: '',
    promedioGeneral: '',
    creditosAprobados: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchWithAuth(`${API_URL}/api/users`);
        // Filtrar solo usuarios que no tienen estudiante asignado o el actual
        const availableUsers = Array.isArray(data) ? data.filter((u: User) => u.rol === 'estudiante' || u.rol === 'ESTUDIANTE') : [];
        setUsers(availableUsers);
        setUsersError(null);

        if (!initialData && availableUsers.length > 0) {
          setFormData((current) => ({
            ...current,
            usuarioId: current.usuarioId || availableUsers[0].id,
          }));
        }
      } catch (err: any) {
        setUsersError(err.message || 'Error al cargar usuarios');
      }
    };

    loadUsers();
  }, [initialData]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        usuarioId: initialData.usuarioId || '',
        codigoUniversitario: initialData.codigoUniversitario || '',
        anioIngreso: initialData.anioIngreso || new Date().getFullYear(),
        escuelaProfesional: initialData.escuelaProfesional || '',
        expedienteAcademicoUrl: initialData.expedienteAcademicoUrl || '',
        promedioGeneral: initialData.promedioGeneral ?? '',
        creditosAprobados: initialData.creditosAprobados || 0,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.usuarioId) {
      setUsersError('Selecciona un usuario');
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
          <Label htmlFor="usuarioId">Usuario</Label>
          <select
            id="usuarioId"
            value={formData.usuarioId ? String(formData.usuarioId) : ''}
            onChange={(e) => setFormData({ ...formData, usuarioId: Number(e.target.value) })}
            className="flex h-12 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            disabled={users.length === 0 || !!initialData}
            required
          >
            {users.length === 0 ? (
              <option value="">No hay usuarios disponibles</option>
            ) : (
              users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nombre} {user.apellido} ({user.email})
                </option>
              ))
            )}
          </select>
          {usersError && <p className="text-sm text-red-600 dark:text-red-400">{usersError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="codigoUniversitario">Código Universitario</Label>
            <Input
              id="codigoUniversitario"
              value={formData.codigoUniversitario}
              onChange={(e) => setFormData({ ...formData, codigoUniversitario: e.target.value })}
              className="bg-background border-border text-foreground"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="anioIngreso">Año de Ingreso</Label>
            <Input
              id="anioIngreso"
              type="number"
              min={1900}
              max={2100}
              value={formData.anioIngreso}
              onChange={(e) => setFormData({ ...formData, anioIngreso: e.target.value === '' ? '' : Number(e.target.value) })}
              className="bg-background border-border text-foreground"
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="escuelaProfesional">Escuela Profesional</Label>
          <Input
            id="escuelaProfesional"
            value={formData.escuelaProfesional}
            onChange={(e) => setFormData({ ...formData, escuelaProfesional: e.target.value })}
            className="bg-background border-border text-foreground"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="promedioGeneral">Promedio General</Label>
            <Input
              id="promedioGeneral"
              type="number"
              min={0}
              max={20}
              step={0.01}
              value={formData.promedioGeneral}
              onChange={(e) => setFormData({ ...formData, promedioGeneral: e.target.value === '' ? '' : Number(e.target.value) })}
              className="bg-background border-border text-foreground"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="creditosAprobados">Créditos Aprobados</Label>
            <Input
              id="creditosAprobados"
              type="number"
              min={0}
              value={formData.creditosAprobados}
              onChange={(e) => setFormData({ ...formData, creditosAprobados: e.target.value === '' ? '' : Number(e.target.value) })}
              className="bg-background border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="expedienteAcademicoUrl">URL Expediente Académico (opcional)</Label>
          <Input
            id="expedienteAcademicoUrl"
            type="url"
            value={formData.expedienteAcademicoUrl}
            onChange={(e) => setFormData({ ...formData, expedienteAcademicoUrl: e.target.value })}
            className="bg-background border-border text-foreground"
            placeholder="https://..."
          />
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
