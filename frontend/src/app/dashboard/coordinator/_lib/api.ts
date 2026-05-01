export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
