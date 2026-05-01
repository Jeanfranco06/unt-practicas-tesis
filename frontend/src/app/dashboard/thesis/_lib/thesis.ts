export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export enum ThesisEstado {
  EN_REGISTRO = 'en_registro',
  PROPUESTO = 'propuesto',
  APROBADO = 'aprobado',
  EN_DESARROLLO = 'en_desarrollo',
  EN_REVISION = 'en_revision',
  CULMINADO = 'culminado',
  DESAPROBADO = 'desaprobado',
}

export interface ThesisProject {
  id: number;
  estudianteId: number;
  titulo: string;
  resumen: string;
  areaConocimiento: string;
  estado: ThesisEstado;
  fechaRegistro: string;
  fechaAprobacion: string | null;
  asignaciones?: ThesisAssignment[];
  entregables?: any[];
  acta?: any[];
}

export interface ThesisAssignment {
  id: number;
  proyectoId: number;
  docenteId: number;
  tipo: 'asesor' | 'jurado';
  rolEspecifico: 'presidente' | 'secretario' | 'vocal' | null;
  fechaAsignacion: string;
  activo: boolean;
  docente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
}

export interface ThesisFormData {
  estudianteId: number | '';
  titulo: string;
  resumen: string;
  areaConocimiento: string;
  estado: ThesisEstado;
}

export const estadoColors: Record<string, string> = {
  en_registro: 'bg-muted text-muted-foreground',
  propuesto: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  aprobado: 'bg-green-500/20 text-green-600 dark:text-green-400',
  en_desarrollo: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  en_revision: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  culminado: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  desaprobado: 'bg-red-500/20 text-red-600 dark:text-red-400',
};

export const estadoLabels: Record<string, string> = {
  en_registro: 'En Registro',
  propuesto: 'Propuesto',
  aprobado: 'Aprobado',
  en_desarrollo: 'En Desarrollo',
  en_revision: 'En Revisión',
  culminado: 'Culminado',
  desaprobado: 'Desaprobado',
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `Error ${res.status}: ${res.statusText}`;
    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {}
    throw new Error(message);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }

  return res.json();
}

export function normalizeThesisFormData(data: ThesisFormData) {
  return {
    ...data,
    estudianteId: data.estudianteId === '' ? 0 : Number(data.estudianteId),
  };
}
