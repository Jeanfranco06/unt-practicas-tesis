export type UserRole = 'Administrador' | 'Coordinador' | 'Asesor' | 'Estudiante' | 'RepresentanteEmpresa' | 'Secretaria';

export interface JWTPayload {
  sub: number;
  email: string;
  roles: UserRole[];
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

export function getUserRoles(token: string): UserRole[] | null {
  const payload = parseJWT(token);
  return payload?.roles || null;
}

export function hasRole(roles: UserRole[] | null, roleToCheck: UserRole): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes(roleToCheck);
}

export function hasAnyRole(roles: UserRole[] | null, rolesToCheck: UserRole[]): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return rolesToCheck.some(role => roles.includes(role));
}

export function getDashboardRouteByRoles(roles: UserRole[] | null): string {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return '/login';
  }

  // Priority order for dashboard routing: Admin roles first, then others
  if (roles.includes('Administrador')) {
    return '/dashboard';
  }

  if (roles.includes('Coordinador')) {
    return '/dashboard/coordinator';
  }

  if (roles.includes('Asesor')) {
    return '/dashboard/advisor';
  }

  if (roles.includes('Secretaria')) {
    return '/dashboard/secretary';
  }

  if (roles.includes('RepresentanteEmpresa')) {
    return '/dashboard/company';
  }

  if (roles.includes('Estudiante')) {
    return '/student/dashboard';
  }

  return '/login';
}

// Backward compatibility function
export function getDashboardRouteByRole(role: UserRole | null): string {
  if (!role) return '/login';
  return getDashboardRouteByRoles([role]);
}

export function getPrimaryRole(roles: UserRole[] | null): UserRole | null {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return null;
  }

  // Priority order for primary role selection
  const priorityOrder: UserRole[] = [
    'Administrador',
    'Coordinador',
    'Asesor',
    'Secretaria',
    'RepresentanteEmpresa',
    'Estudiante'
  ];

  for (const priorityRole of priorityOrder) {
    if (roles.includes(priorityRole)) {
      return priorityRole;
    }
  }

  return roles[0]; // fallback to first role if no priority match
}

// Backward compatibility - alias for getPrimaryRole
export function getUserRole(token: string): UserRole | null {
  const roles = getUserRoles(token);
  return getPrimaryRole(roles);
}
