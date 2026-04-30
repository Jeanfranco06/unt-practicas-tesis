'use client';

import { useState, useEffect, useCallback } from 'react';
import { parseJWT, JWTPayload } from '@/lib/jwt';

export type UserRole = JWTPayload['rol'];

interface AuthState {
  user: JWTPayload | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = parseJWT(token);
      setAuth({
        user: payload,
        role: payload?.rol || null,
        isAuthenticated: !!payload,
        isLoading: false,
      });
    } else {
      setAuth({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    setAuth({
      user: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = '/login';
  }, []);

  const hasRole = useCallback((roles: UserRole[]) => {
    return !!auth.role && roles.includes(auth.role);
  }, [auth.role]);

  return {
    ...auth,
    refresh,
    logout,
    hasRole,
  };
}
