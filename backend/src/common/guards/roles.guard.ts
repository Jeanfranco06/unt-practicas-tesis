import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RoleName } from '../../modules/users/entities/role.entity';
import { RolUsuario } from '../../modules/users/entities/user.entity';

const roleNameToRolUsuario: Record<RoleName, RolUsuario> = {
  [RoleName.ADMIN]: RolUsuario.ADMIN,
  [RoleName.COORDINADOR]: RolUsuario.COORDINADOR,
  [RoleName.ASESOR]: RolUsuario.ASESOR,
  [RoleName.ESTUDIANTE]: RolUsuario.ESTUDIANTE,
  [RoleName.REPRESENTANTE_EMPRESA]: RolUsuario.REPRESENTANTE_EMPRESA,
};

const rolUsuarioToRoleName: Record<RolUsuario, RoleName> = {
  [RolUsuario.ADMIN]: RoleName.ADMIN,
  [RolUsuario.COORDINADOR]: RoleName.COORDINADOR,
  [RolUsuario.ASESOR]: RoleName.ASESOR,
  [RolUsuario.ESTUDIANTE]: RoleName.ESTUDIANTE,
  [RolUsuario.REPRESENTANTE_EMPRESA]: RoleName.REPRESENTANTE_EMPRESA,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Array<RoleName | RolUsuario>>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    console.log('[RolesGuard] User from JWT:', { userId: user?.sub, roles: user?.roles, rol: user?.rol });
    console.log('[RolesGuard] Required roles:', requiredRoles);
    
    if (!user || (!user.roles && !user.rol)) {
      throw new ForbiddenException(`No tiene permiso para acceder a este recurso. Usuario: ${user?.sub}, Roles: ${JSON.stringify(user?.roles)}`);
    }
    
    const userRoles = Array.isArray(user.roles)
      ? [...user.roles]
      : user.roles
      ? [user.roles]
      : [];

    if (user.rol) {
      userRoles.push(user.rol);
    }
    const hasRole = requiredRoles.some(requiredRole => 
      userRoles.some((userRole: any) => {
        if (typeof userRole === 'string') {
          const matches = (
            userRole === requiredRole ||
            userRole === roleNameToRolUsuario[requiredRole as RoleName] ||
            userRole === rolUsuarioToRoleName[requiredRole as RolUsuario]
          );
          console.log(`[RolesGuard] Comparing userRole "${userRole}" with required "${requiredRole}": ${matches}`);
          return matches;
        }

        const userRoleName = userRole.nombre;
        const matches = (
          userRoleName === requiredRole ||
          userRoleName === rolUsuarioToRoleName[requiredRole as RolUsuario] ||
          userRoleName === roleNameToRolUsuario[requiredRole as RoleName]
        );
        console.log(`[RolesGuard] Comparing userRole.nombre "${userRoleName}" with required "${requiredRole}": ${matches}`);
        return matches;
      })
    );
    
    if (!hasRole) {
      throw new ForbiddenException(`No tiene permiso. Roles del usuario: [${userRoles.join(', ')}]. Roles requeridos: [${requiredRoles.join(', ')}]`);
    }
    
    return true;
  }
}