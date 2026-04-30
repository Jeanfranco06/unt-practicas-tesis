import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JWTPayload {
  sub: number;
  email: string;
  rol: 'Estudiante' | 'Administrador' | 'Coordinador' | 'Asesor' | 'Representante_Empresa';
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

function getDashboardRouteByRole(role: JWTPayload['rol'] | null): string {
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

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value;
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register') || pathname.startsWith('/forgot-password');
  const isStudentRoute = pathname.startsWith('/student');
  const isAdminRoute = pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/companies') || pathname.startsWith('/internships') || pathname.startsWith('/students') || pathname.startsWith('/thesis') || pathname.startsWith('/reports');
  
  // Get user role from token
  const payload = token ? parseJWT(token) : null;
  const userRole = payload?.rol || null;

  // Redirect authenticated users from auth pages to their dashboard
  if (isAuthPage && token) {
    const dashboard = getDashboardRouteByRole(userRole);
    return NextResponse.redirect(new URL(dashboard, request.url));
  }

  // Protect student routes - require authentication
  if (isStudentRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If student tries to access admin routes, redirect to student dashboard
  if (isAdminRoute && token && userRole === 'Estudiante') {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  // Protect admin routes - require authentication
  if (isAdminRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow all other routes to proceed (including student routes for authenticated users)

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};