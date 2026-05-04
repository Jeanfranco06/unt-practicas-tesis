export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Helper para construir URL completa de documentos
export function getDocumentUrl(documentoUrl?: string): string | undefined {
  if (!documentoUrl) return undefined;
  // Si ya es URL completa, retornarla
  if (documentoUrl.startsWith('http')) return documentoUrl;
  // Si empieza con /, concatenar con API_URL
  return `${API_URL}${documentoUrl}`;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error desconocido' }));
    throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Postulaciones
export async function getPendingApplications() {
  return fetchWithAuth(`${API_URL}/api/internships/pending-applications`);
}

export async function reviewApplication(id: number, estado: 'aprobado' | 'rechazado', comentario?: string) {
  return fetchWithAuth(`${API_URL}/api/internships/applications/${id}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ estado, comentario }),
  });
}

// Asesores
export async function getAdvisors() {
  return fetchWithAuth(`${API_URL}/api/users/role/advisors`);
}

// Prácticas pendientes de asignación
export async function getPendingInternships() {
  return fetchWithAuth(`${API_URL}/api/internships/pending-internships`);
}

// Todas las prácticas con asesor (para carga docente)
export async function getAllInternships() {
  return fetchWithAuth(`${API_URL}/api/internships/internships`);
}

export async function assignAdvisor(internshipId: number, advisorId: number) {
  return fetchWithAuth(`${API_URL}/api/internships/internship/${internshipId}/assign-advisor/${advisorId}`, {
    method: 'PATCH',
  });
}

// Tesis y asignaciones
export async function getThesisProjects() {
  return fetchWithAuth(`${API_URL}/api/thesis/projects`);
}

export async function assignThesisAdvisor(dto: { proyectoId: number; docenteId: number; tipo: 'asesor' | 'jurado'; rolEspecifico?: string }) {
  return fetchWithAuth(`${API_URL}/api/thesis/assignments`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export async function removeThesisAssignment(assignmentId: number) {
  return fetchWithAuth(`${API_URL}/api/thesis/assignments/${assignmentId}`, {
    method: 'DELETE',
  });
}

// Convenios
export async function getAgreements() {
  return fetchWithAuth(`${API_URL}/api/agreements`);
}

export async function createAgreement(data: any) {
  return fetchWithAuth(`${API_URL}/api/agreements`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createAgreementWithDocument(data: any, documentoFile?: File) {
  const formData = new FormData();
  
  // Agregar campos del convenio
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, String(data[key]));
    }
  });
  
  // Agregar archivo si existe
  if (documentoFile) {
    formData.append('documento', documentoFile);
  }
  
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/api/agreements`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al crear convenio' }));
    throw new Error(error.message || `Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

export async function updateAgreementWithDocument(id: number, data: any, documentoFile?: File) {
  const formData = new FormData();
  
  // Agregar campos del convenio
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, String(data[key]));
    }
  });
  
  // Agregar archivo si existe
  if (documentoFile) {
    formData.append('documento', documentoFile);
  }
  
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_URL}/api/agreements/${id}`, {
    method: 'PATCH',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Error al actualizar convenio' }));
    throw new Error(error.message || `Error ${res.status}: ${res.statusText}`);
  }
  
  return res.json();
}

export async function updateAgreement(id: number, data: any) {
  return fetchWithAuth(`${API_URL}/api/agreements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function renewAgreement(id: number, nuevaFecha: string) {
  return fetchWithAuth(`${API_URL}/api/agreements/${id}/renew`, {
    method: 'PATCH',
    body: JSON.stringify({ nuevaFecha }),
  });
}

export async function deleteAgreement(id: number) {
  return fetchWithAuth(`${API_URL}/api/agreements/${id}`, {
    method: 'DELETE',
  });
}

// Empresas
export async function getCompanies() {
  return fetchWithAuth(`${API_URL}/api/companies`);
}

// Ofertas de práctica (aprobación por coordinador: publicar o rechazar borradores)
export async function getDraftOffers() {
  const res = await fetchWithAuth(`${API_URL}/api/internships/offers?estado=borrador&limit=500`);
  return Array.isArray(res) ? res : (res?.data ?? []);
}

export async function getDraftOffersCount() {
  const res = await fetchWithAuth(`${API_URL}/api/internships/offers?estado=borrador&limit=1`);
  if (res && typeof res.total === 'number') return res.total;
  const data = Array.isArray(res) ? res : (res?.data ?? []);
  return data.length;
}

export async function publishInternshipOffer(id: number) {
  return fetchWithAuth(`${API_URL}/api/internships/offers/${id}/publish`, { method: 'PATCH' });
}

export async function rejectInternshipOffer(id: number) {
  return fetchWithAuth(`${API_URL}/api/internships/offers/${id}`, { method: 'DELETE' });
}
