import { SetMetadata } from '@nestjs/common';
import { RolUsuario } from '../../modules/users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolUsuario[]) => SetMetadata(ROLES_KEY, roles);