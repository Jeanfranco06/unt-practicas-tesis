'use client';

import { useState, useEffect, useCallback } from 'react';
import { parseJWT, JWTPayload, UserRole, getPrimaryRole, hasRole as hasRoleUtil, hasAnyRole as hasAnyRoleUtil } from '@/lib/jwt';

// Re-export UserRole for convenience
export type { UserRole } from '@/lib/jwt';

interface AuthState {
  user: JWTPayload | null;
  roles: UserRole[] | null;
  primaryRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    roles: null,
    primaryRole: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('accessToken');
    if (token) {
      const payload = parseJWT(token);
      const roles = payload?.roles || null;
      const primaryRole = getPrimaryRole(roles);
      
      setAuth({
        user: payload,
        roles,
        primaryRole,
        isAuthenticated: !!payload,
        isLoading: false,
      });
    } else {
      setAuth({
        user: null,
        roles: null,
        primaryRole: null,
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
      roles: null,
      primaryRole: null,
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = '/login';
  }, []);

  const hasRole = useCallback((roleToCheck: UserRole) => {
    return hasRoleUtil(auth.roles, roleToCheck);
  }, [auth.roles]);

  const hasAnyRole = useCallback((rolesToCheck: UserRole[]) => {
    return hasAnyRoleUtil(auth.roles, rolesToCheck);
  }, [auth.roles]);

  const hasAllRoles = useCallback((rolesToCheck: UserRole[]) => {
    if (!auth.roles || !Array.isArray(auth.roles)) return false;
    return rolesToCheck.every(role => auth.roles!.includes(role));
  }, [auth.roles]);

  // Backward compatibility
  const hasRoleLegacy = useCallback((roles: UserRole[]) => {
    return hasAnyRole(roles);
  }, [hasAnyRole]);

  return {
    ...auth,
    role: auth.primaryRole, // Backward compatibility
    refresh,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasRoleLegacy, // For backward compatibility
  };
}
