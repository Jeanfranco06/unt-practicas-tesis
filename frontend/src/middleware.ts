import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

type UserRole = 'Administrador' | 'Coordinador' | 'Asesor' | 'Estudiante' | 'RepresentanteEmpresa' | 'Secretaria';

interface JWTPayload {
  sub: number;
  email: string;
  roles: UserRole[];
  iat: number;
  exp: number;
}

function parseJWT(token: string): JWTPayload | null {
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

function getDashboardRouteByRoles(roles: UserRole[] | null): string {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return '/login';
  }

  // Redirect each role to their specific dashboard
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

function hasRole(roles: UserRole[] | null, roleToCheck: UserRole): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  return roles.includes(roleToCheck);
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isStudentRoute = pathname.startsWith('/student');
  const isAdminRoute = pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/companies') || pathname.startsWith('/internships') || pathname.startsWith('/students') || pathname.startsWith('/thesis') || pathname.startsWith('/reports');
  
  // Get user roles from token
  const payload = token ? parseJWT(token) : null;
  const userRoles = payload?.roles || null;

  // Redirect authenticated users from auth pages to their dashboard
  if (isAuthPage && token && userRoles) {
    const dashboard = getDashboardRouteByRoles(userRoles);
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  if (isAuthPage && token && !userRoles) {
    const response = NextResponse.next();
    response.cookies.delete('accessToken');
    return response;
  }

  // Protect student routes - require authentication
  if (isStudentRoute && (!token || !userRoles)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }
  
  // Redirect coordinators accessing general dashboard to coordinator dashboard
  if (pathname === '/dashboard' && token && hasRole(userRoles, 'Coordinador') && !hasRole(userRoles, 'Administrador')) {
    return NextResponse.redirect(new URL('/dashboard/coordinator', request.url));
  }

  // Protect /dashboard/users route - only Admin can access
  if (pathname.startsWith('/dashboard/users') && token && hasRole(userRoles, 'Coordinador') && !hasRole(userRoles, 'Administrador')) {
    return NextResponse.redirect(new URL('/dashboard/coordinator', request.url));
  }

  // Redirect advisors accessing general dashboard to advisor dashboard
  if (pathname === '/dashboard' && token && hasRole(userRoles, 'Asesor') && !hasRole(userRoles, 'Administrador') && !hasRole(userRoles, 'Coordinador')) {
    return NextResponse.redirect(new URL('/dashboard/advisor', request.url));
  }

  // Redirect secretaries accessing general dashboard to secretary dashboard
  if (pathname === '/dashboard' && token && hasRole(userRoles, 'Secretaria') && !hasRole(userRoles, 'Administrador') && !hasRole(userRoles, 'Coordinador') && !hasRole(userRoles, 'Asesor')) {
    return NextResponse.redirect(new URL('/dashboard/secretary', request.url));
  }

  // Redirect company representatives accessing general dashboard to company dashboard
  if (pathname === '/dashboard' && token && hasRole(userRoles, 'RepresentanteEmpresa') && !hasRole(userRoles, 'Administrador') && !hasRole(userRoles, 'Coordinador') && !hasRole(userRoles, 'Asesor') && !hasRole(userRoles, 'Secretaria')) {
    return NextResponse.redirect(new URL('/dashboard/company', request.url));
  }

  // If student tries to access admin routes, redirect to student dashboard
  if (isAdminRoute && token && hasRole(userRoles, 'Estudiante') && !hasRole(userRoles, 'Administrador') && !hasRole(userRoles, 'Coordinador') && !hasRole(userRoles, 'Asesor') && !hasRole(userRoles, 'RepresentanteEmpresa')) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // Protect admin routes - require authentication
  if (isAdminRoute && (!token || !userRoles)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('accessToken');
    return response;
  }

  // Allow all other routes to proceed (including student routes for authenticated users)

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};