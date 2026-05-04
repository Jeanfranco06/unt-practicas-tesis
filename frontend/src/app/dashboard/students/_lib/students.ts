export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Student {
  id: number;
  usuarioId: number;
  usuario?: {
    id: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    email: string;
  };
  carreraId: number;
  codigoUniversitario: string;
  anioIngreso: number;
  escuelaProfesional: string;
  expedienteAcademicoUrl?: string;
  promedioGeneral?: number;
  creditosAprobados: number;
  activo: boolean;
}

export interface StudentFormData {
  usuarioId: number | '';
  carreraId: number | '';
  codigoUniversitario: string;
  anioIngreso: number | '';
  escuelaProfesional: string;
  expedienteAcademicoUrl?: string;
  promedioGeneral?: number | '';
  creditosAprobados?: number | '';
}

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

export function normalizeStudentFormData(data: StudentFormData) {
  return {
    ...data,
    usuarioId: data.usuarioId === '' ? 0 : Number(data.usuarioId),
    carreraId: data.carreraId === '' ? 0 : Number(data.carreraId),
    anioIngreso: data.anioIngreso === '' ? new Date().getFullYear() : Number(data.anioIngreso),
    creditosAprobados: data.creditosAprobados === '' ? 0 : Number(data.creditosAprobados),
    promedioGeneral: data.promedioGeneral === '' ? undefined : Number(data.promedioGeneral),
    expedienteAcademicoUrl: data.expedienteAcademicoUrl === '' ? undefined : data.expedienteAcademicoUrl,
  };
}
