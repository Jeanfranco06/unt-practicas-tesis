import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../modules/users/entities/role.entity';
import { RolUsuario } from '../../modules/users/entities/user.entity';

export type RoleType = RoleName | RolUsuario;

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);