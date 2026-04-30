export interface JWTPayload {
  sub: number;
  email: string;
  rol: 'Estudiante' | 'Administrador' | 'Coordinador' | 'Asesor' | 'Representante_Empresa';
  iat: number;
  exp: number;
}

export function parseJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function getUserRole(token: string): JWTPayload['rol'] | null {
  const payload = parseJWT(token);
  return payload?.rol || null;
}

export function getDashboardRouteByRole(role: JWTPayload['rol'] | null): string {
  switch (role) {
    case 'Estudiante':
      return '/student/dashboard';
    case 'Administrador':
    case 'Coordinador':
    case 'Asesor':
    case 'Representante_Empresa':
      return '/dashboard';
    default:
      return '/login';
  }
}
