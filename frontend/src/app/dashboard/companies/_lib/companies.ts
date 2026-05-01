export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Company {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  emailContacto: string | null;
  representanteNombre: string | null;
  activo: boolean;
  creadoEn: string;
  convenios?: any[];
  ofertas?: any[];
}

export interface CompanyFormData {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  emailContacto: string;
  representanteNombre: string;
  activo: boolean;
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

export function normalizeCompanyFormData(data: CompanyFormData) {
  return {
    ...data,
    activo: data.activo ?? true,
  };
}
