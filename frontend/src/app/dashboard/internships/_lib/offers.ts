'use client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Offer {
  id: number;
  titulo: string;
  descripcion?: string;
  requisitos?: string;
  empresa?: { razonSocial: string; id: number };
  empresaId: number;
  cupos: number;
  estado: string;
  fechaInicioPostulacion: string;
  fechaFinPostulacion: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
}

export interface Company {
  id: number;
  razonSocial: string;
  nombreComercial?: string;
  activo?: boolean;
}

export const estadoColors: Record<string, string> = {
  BORRADOR: 'bg-slate-500/20 text-slate-400',
  PUBLICADA: 'bg-blue-500/20 text-blue-400',
  CERRADA: 'bg-amber-500/20 text-amber-400',
  CANCELADA: 'bg-red-500/20 text-red-400',
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
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      window.location.href = '/login';
    }
    throw new Error('Tu sesión expiró. Inicia sesión nuevamente.');
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Error al procesar la solicitud');
  }

  return res.json();
}

export function normalizeOfferFormData(data: OfferFormData) {
  return {
    ...data,
    cupos: data.cupos === '' ? 1 : data.cupos,
    fechaInicioPostulacion: new Date(data.fechaInicioPostulacion).toISOString(),
    fechaFinPostulacion: new Date(data.fechaFinPostulacion).toISOString(),
    fechaInicioPractica: new Date(data.fechaInicioPractica).toISOString(),
    fechaFinPractica: new Date(data.fechaFinPractica).toISOString(),
  };
}

export interface OfferFormData {
  titulo: string;
  descripcion: string;
  requisitos: string;
  empresaId: number;
  cupos: number | '';
  fechaInicioPostulacion: string;
  fechaFinPostulacion: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
}
