export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface Company {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial: string | null;
  direccion: string | null;
  telefono: string | null;
  emailContacto: string | null;
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

/**
 * Valida el dígito verificador del RUC según SUNAT
 */
function validarDigitoVerificadorRUC(ruc: string): boolean {
  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const numeros = ruc.substring(0, 10).split('').map(Number);
  const digitoVerificador = parseInt(ruc.charAt(10), 10);

  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += numeros[i] * factores[i];
  }

  const resto = suma % 11;
  const digitoEsperado = (11 - resto) % 10;

  return digitoEsperado === digitoVerificador;
}

/**
 * Calcula el dígito verificador para un RUC (primeros 10 dígitos)
 */
export function calcularDigitoVerificadorRUC(ruc10: string): string {
  if (ruc10.length !== 10 || !/^\d{10}$/.test(ruc10)) {
    return '';
  }

  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const numeros = ruc10.split('').map(Number);

  let suma = 0;
  for (let i = 0; i < 10; i++) {
    suma += numeros[i] * factores[i];
  }

  const resto = suma % 11;
  const digitoVerificador = (11 - resto) % 10;

  return digitoVerificador.toString();
}

/**
 * Valida completamente un RUC peruano
 */
export function validateRUC(ruc: string): { isValid: boolean; message: string } {
  if (!ruc || ruc.length !== 11) {
    return { isValid: false, message: 'El RUC debe tener 11 dígitos' };
  }

  if (!/^\d{11}$/.test(ruc)) {
    return { isValid: false, message: 'El RUC debe contener solo números' };
  }

  const tipoRuc = ruc.substring(0, 2);
  const tiposValidos = ['10', '15', '16', '17', '20'];
  if (!tiposValidos.includes(tipoRuc)) {
    return { isValid: false, message: 'El RUC debe empezar con 10, 15, 16, 17 o 20' };
  }

  if (!validarDigitoVerificadorRUC(ruc)) {
    return { isValid: false, message: 'El dígito verificador del RUC es inválido' };
  }

  return { isValid: true, message: 'RUC válido' };
}

/**
 * Genera un RUC de prueba válido basado en un prefijo
 */
export function generarRUCPrueba(prefijo: string = '20'): string {
  // 10 dígitos base (prefijo 2 + 8 aleatorios) + 1 dígito verificador = 11
  let base = prefijo;
  for (let i = 0; i < 8; i++) {
    base += Math.floor(Math.random() * 10);
  }

  const digitoVerificador = calcularDigitoVerificadorRUC(base);
  return base + digitoVerificador;
}
