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
  borrador: 'bg-muted text-muted-foreground',
  publicada: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
  cerrada: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
  cancelada: 'bg-red-500/20 text-red-600 dark:text-red-400',
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  
  // Don't set Content-Type for FormData - let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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
    const text = await res.text();
    let errorMessage = text || 'Error al procesar la solicitud';
    
    // Intentar parsear como JSON para extraer el mensaje
    try {
      const json = JSON.parse(text);
      if (json.message) {
        errorMessage = json.message;
      }
    } catch {
      // Si no es JSON, usar el texto como está
    }
    
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 No Content or void returns)
  const contentType = res.headers.get('content-type');
  const text = await res.text();
  
  if (!text || text.trim() === '') {
    return { success: true };
  }

  if (contentType?.includes('application/json')) {
    return JSON.parse(text);
  }

  return { success: true, data: text };
}

export function normalizeOfferFormData(data: OfferFormData) {
  return {
    ...data,
    cupos: data.cupos === '' ? 1 : data.cupos,
    fechaInicioPostulacion: new Date(data.fechaInicioPostulacion).toISOString(),
    fechaFinPostulacion: new Date(data.fechaFinPostulacion).toISOString(),
    fechaInicioPractica: new Date(data.fechaInicioPractica).toISOString(),
    fechaFinPractica: new Date(data.fechaFinPractica).toISOString(),
    estado: data.estado || 'publicada',
  };
}

export interface OfferFormData {
  titulo: string;
  descripcion: string;
  requisitos: string;
  empresaId: number;
  cupos: number | '';
  estado: string;
  fechaInicioPostulacion: string;
  fechaFinPostulacion: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
}
