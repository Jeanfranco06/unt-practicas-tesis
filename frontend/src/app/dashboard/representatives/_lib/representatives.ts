export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Company {
  id: number;
  razonSocial: string;
  ruc: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo?: boolean;
}

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  activo: boolean;
}

export interface CompanyRepresentative {
  id: number;
  empresaId: number;
  empresa?: Company;
  usuarioId: number;
  usuario?: User;
  cargo: string;
  departamento?: string;
  telefonoDirecto?: string;
  esPrincipal: boolean;
}

export interface RepresentativeFormData {
  empresaId: number;
  cargo: string;
  departamento?: string;
  telefonoDirecto?: string;
  esPrincipal?: boolean;
}

// Internal fetch with auth
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

// API Functions
export async function getRepresentatives(): Promise<CompanyRepresentative[]> {
  return fetchWithAuth(`${API_URL}/api/company-representatives`);
}

export async function getRepresentative(id: number): Promise<CompanyRepresentative> {
  return fetchWithAuth(`${API_URL}/api/company-representatives/${id}`);
}

export async function getRepresentativesByCompany(empresaId: number): Promise<CompanyRepresentative[]> {
  return fetchWithAuth(`${API_URL}/api/company-representatives/company/${empresaId}`);
}

export async function updateRepresentative(
  id: number,
  data: Partial<RepresentativeFormData>
): Promise<CompanyRepresentative> {
  return fetchWithAuth(`${API_URL}/api/company-representatives/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteRepresentative(id: number): Promise<void> {
  return fetchWithAuth(`${API_URL}/api/company-representatives/${id}`, {
    method: 'DELETE',
  });
}

export async function activateRepresentative(id: number): Promise<CompanyRepresentative> {
  return fetchWithAuth(`${API_URL}/api/company-representatives/${id}/activate`, {
    method: 'PATCH',
  });
}

export async function getCompanies(): Promise<Company[]> {
  return fetchWithAuth(`${API_URL}/api/companies`);
}

// Helpers
export function getFullName(representative: CompanyRepresentative): string {
  if (!representative.usuario) return 'Sin nombre';
  const { nombre, apellidoPaterno, apellidoMaterno } = representative.usuario;
  return `${nombre || ''} ${apellidoPaterno || ''} ${apellidoMaterno || ''}`.trim();
}

export function getInitials(representative: CompanyRepresentative): string {
  if (!representative.usuario) return '??';
  const { nombre, apellidoPaterno } = representative.usuario;
  return `${(nombre?.[0] || '').toUpperCase()}${(apellidoPaterno?.[0] || '').toUpperCase()}`;
}

export function getAvatarColor(representative: CompanyRepresentative): string {
  if (!representative.usuario) return 'bg-gray-500';
  const colors = [
    'bg-blue-500',
    'bg-emerald-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];
  const index = (representative.usuario.id || 0) % colors.length;
  return colors[index];
}

export function normalizeRepresentativeFormData(data: RepresentativeFormData): RepresentativeFormData {
  return {
    ...data,
    cargo: data.cargo?.trim(),
    departamento: data.departamento?.trim() || undefined,
    telefonoDirecto: data.telefonoDirecto?.trim() || undefined,
  };
}
