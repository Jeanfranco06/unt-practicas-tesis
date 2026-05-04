'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { StudentForm } from '../_components/StudentForm';
import { API_URL, fetchWithAuth, normalizeStudentFormData } from '../_lib/students';
import { GraduationCap, AlertCircle, Plus } from 'lucide-react';

export default function NewStudentPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (data: ReturnType<typeof normalizeStudentFormData>) => {
    try {
      await fetchWithAuth(`${API_URL}/api/students`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      toast({
        title: 'Éxito',
        description: 'Estudiante creado exitosamente.',
        variant: 'default',
      });
      router.push('/dashboard/students');
    } catch (err: any) {
      toast({
        title: 'Error al crear estudiante',
        description: err.message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Nuevo Estudiante</h1>
        <p className="text-muted-foreground text-sm mt-1">Registra un nuevo estudiante en el sistema</p>
      </div>

      {/* Info Banner - Flujo de creación */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800 rounded-xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <p className="font-medium text-foreground">¿Cómo crear un estudiante?</p>
            <p className="text-sm text-muted-foreground">
              Hay tres formas de crear un estudiante:
            </p>
            <div className="grid sm:grid-cols-3 gap-3 text-sm pt-1">
              <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-amber-200 dark:border-amber-800">
                <GraduationCap className="w-4 h-4 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground block">1. Flujo Automatizado (Recomendado)</span>
                  <span className="text-muted-foreground text-xs">Crea usuario + perfil de estudiante juntos. Código y email automáticos.</span>
                  <Button asChild size="sm" className="mt-2 bg-amber-500 hover:bg-amber-600 text-white">
                    <Link href="/dashboard/users/new/student">
                      <Plus className="w-3 h-3 mr-1" />
                      Flujo Automatizado
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-blue-200 dark:border-blue-800">
                <GraduationCap className="w-4 h-4 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground block">2. Vincular Usuario Base</span>
                  <span className="text-muted-foreground text-xs">Esta página. Selecciona un usuario sin rol y conviértelo en estudiante.</span>
                  <p className="text-xs text-blue-600 mt-1">Requiere: Usuario base creado previamente</p>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-slate-800">
                <GraduationCap className="w-4 h-4 text-slate-600 mt-0.5" />
                <div>
                  <span className="font-medium text-foreground block">3. Crear Usuario Base Primero</span>
                  <span className="text-muted-foreground text-xs">Crea un usuario sin rol, luego vincúlalo como estudiante.</span>
                  <Button asChild variant="outline" size="sm" className="mt-2">
                    <Link href="/dashboard/users/new/base">
                      <Plus className="w-3 h-3 mr-1" />
                      Crear Usuario Base
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StudentForm
        title="Información del Estudiante"
        submitLabel="Crear Estudiante"
        onCancel={() => router.push('/dashboard/students')}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
