export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

// Tipos
export interface Company {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string;
  direccion?: string;
  telefono?: string;
  emailContacto?: string;
  activo: boolean;
}

export interface InternshipOffer {
  id: number;
  titulo: string;
  descripcion?: string;
  requisitos: string;
  fechaInicioPostulacion: string;
  fechaFinPostulacion: string;
  fechaInicioPractica: string;
  fechaFinPractica: string;
  cupos: number;
  estado: 'borrador' | 'publicada' | 'cerrada' | 'cancelada';
  empresaId: number;
  convenioId?: number;
}

export interface InternshipApplication {
  id: number;
  ofertaId: number;
  estudianteId: number;
  documentoCvUrl?: string;
  cartaPresentacion?: string;
  estado: 'postulado' | 'preseleccionado' | 'rechazado' | 'aprobado';
  fechaPostulacion: string;
  fechaRevision?: string;
  oferta?: InternshipOffer;
  estudiante?: {
    id: number;
    codigoEstudiante: string;
    usuario?: {
      nombre: string;
      apellidoPaterno: string;
      apellidoMaterno: string;
      email: string;
    };
  };
}

export interface Agreement {
  id: number;
  empresaId: number;
  tipo: 'marco' | 'especifico';
  objetoContrato: string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: 'vigente' | 'vencido' | 'renovado';
  documentoUrl?: string;
  empresa?: Company;
}
