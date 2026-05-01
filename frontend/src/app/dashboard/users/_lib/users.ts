'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export enum RolUsuario {
  ADMIN = 'Administrador',
  COORDINADOR = 'Coordinador',
  ASESOR = 'Asesor',
  ESTUDIANTE = 'Estudiante',
  REPRESENTANTE_EMPRESA = 'RepresentanteEmpresa',
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: RolUsuario;
  activo: boolean;
  creadoEn?: string;
}

export interface CreateUserData {
  email: string;
  contrasenaHash: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: RolUsuario;
  activo?: boolean;
}

export interface UpdateUserData {
  email?: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rol?: RolUsuario;
  activo?: boolean;
  contrasenaHash?: string;
}

export const rolColors: Record<RolUsuario, string> = {
  [RolUsuario.ADMIN]: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  [RolUsuario.COORDINADOR]: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  [RolUsuario.ASESOR]: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  [RolUsuario.ESTUDIANTE]: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  [RolUsuario.REPRESENTANTE_EMPRESA]: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
};

export const rolLabels: Record<RolUsuario, string> = {
  [RolUsuario.ADMIN]: 'Administrador',
  [RolUsuario.COORDINADOR]: 'Coordinador',
  [RolUsuario.ASESOR]: 'Asesor',
  [RolUsuario.ESTUDIANTE]: 'Estudiante',
  [RolUsuario.REPRESENTANTE_EMPRESA]: 'Representante',
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

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    throw new Error('Tu sesión expiró');
  }

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = text || 'Error al procesar la solicitud';
    try {
      const json = JSON.parse(text);
      if (json.message) errorMessage = json.message;
    } catch {}
    throw new Error(errorMessage);
  }

  const text = await res.text();
  if (!text) return { success: true };
  return JSON.parse(text);
}

export async function getUsers(): Promise<User[]> {
  return fetchWithAuth(`${API_URL}/api/users`);
}

export async function getUser(id: number): Promise<User> {
  return fetchWithAuth(`${API_URL}/api/users/${id}`);
}

export async function createUser(data: CreateUserData): Promise<User> {
  return fetchWithAuth(`${API_URL}/api/users`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  return fetchWithAuth(`${API_URL}/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteUser(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/api/users/${id}`, { method: 'DELETE' });
}

export async function toggleUserStatus(id: number, activo: boolean): Promise<User> {
  return fetchWithAuth(`${API_URL}/api/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ activo }),
  });
}

export async function getPendingAdvisors(): Promise<User[]> {
  return fetchWithAuth(`${API_URL}/api/users/pending-advisors`);
}

export async function approveUser(id: number): Promise<User> {
  return fetchWithAuth(`${API_URL}/api/users/${id}/approve`, {
    method: 'POST',
  });
}

export async function rejectUser(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/api/users/${id}/reject`, {
    method: 'POST',
  });
}

export function getFullName(user: User): string {
  return `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno}`.trim();
}

export function getInitials(user: User): string {
  return `${user.nombre.charAt(0)}${user.apellidoPaterno.charAt(0)}`.toUpperCase();
}

export function getAvatarColor(user: User): string {
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500'];
  return colors[user.id % colors.length];
}

export function getStatusBadgeColor(activo: boolean): string {
  return activo
    ? 'bg-green-500/20 text-green-600 dark:text-green-400'
    : 'bg-red-500/20 text-red-600 dark:text-red-400';
}

export function filterUsers(users: User[], searchTerm: string, roleFilter: string, statusFilter: string): User[] {
  return users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.nombre?.toLowerCase().includes(searchLower) ||
      user.apellidoPaterno?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower);
    const matchesRole = roleFilter === 'todos' || user.rol === roleFilter;
    const matchesStatus = statusFilter === 'todos' || (statusFilter === 'activo' && user.activo) || (statusFilter === 'inactivo' && !user.activo);
    return matchesSearch && matchesRole && matchesStatus;
  });
}

export const rolSelectOptions = [
  { value: RolUsuario.ADMIN, label: 'Administrador' },
  { value: RolUsuario.COORDINADOR, label: 'Coordinador' },
  { value: RolUsuario.ASESOR, label: 'Asesor' },
  { value: RolUsuario.ESTUDIANTE, label: 'Estudiante' },
  { value: RolUsuario.REPRESENTANTE_EMPRESA, label: 'Representante de Empresa' },
];

export const statusOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'activo', label: 'Activos' },
  { value: 'inactivo', label: 'Inactivos' },
];
