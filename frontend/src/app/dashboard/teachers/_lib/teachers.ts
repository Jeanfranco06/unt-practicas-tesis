export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Teacher {
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
  carrera?: {
    id: number;
    nombre: string;
    codigo?: string;
  };
  especialidad: string;
  categoria: string;
  dedicacion: string;
  oficina?: string;
  telefono?: string;
}

export interface TeacherFormData {
  usuarioId: number | '';
  carreraId: number | '';
  especialidad: string;
  categoria: string;
  dedicacion: string;
  oficina: string;
  telefono: string;
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

export async function getTeachers(): Promise<Teacher[]> {
  return fetchWithAuth(`${API_URL}/api/teachers`);
}

export async function getTeacher(id: number): Promise<Teacher> {
  return fetchWithAuth(`${API_URL}/api/teachers/${id}`);
}

export async function updateTeacher(id: number, data: Partial<TeacherFormData>): Promise<Teacher> {
  return fetchWithAuth(`${API_URL}/api/teachers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteTeacher(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/api/teachers/${id}`, {
    method: 'DELETE',
  });
}

export async function getCareers(): Promise<{ id: number; nombre: string; codigo?: string }[]> {
  return fetchWithAuth(`${API_URL}/api/users/careers/list`);
}

export function getFullName(teacher: Teacher): string {
  if (teacher.usuario) {
    return `${teacher.usuario.nombre} ${teacher.usuario.apellidoPaterno} ${teacher.usuario.apellidoMaterno}`.trim();
  }
  return 'Sin nombre';
}

export function getInitials(teacher: Teacher): string {
  if (teacher.usuario) {
    return `${teacher.usuario.nombre.charAt(0)}${teacher.usuario.apellidoPaterno.charAt(0)}`.toUpperCase();
  }
  return '??';
}

export function getAvatarColor(teacher: Teacher): string {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  return colors[teacher.id % colors.length];
}

export const categoriaOptions = [
  { value: '', label: 'Seleccionar categoría' },
  { value: 'Auxiliar', label: 'Auxiliar' },
  { value: 'Asistente', label: 'Asistente' },
  { value: 'Asociado', label: 'Asociado' },
  { value: 'Principal', label: 'Principal' },
];

export const dedicacionOptions = [
  { value: '', label: 'Seleccionar dedicación' },
  { value: 'Tiempo Completo', label: 'Tiempo Completo' },
  { value: 'Medio Tiempo', label: 'Medio Tiempo' },
  { value: 'Tiempo Parcial', label: 'Tiempo Parcial' },
];
