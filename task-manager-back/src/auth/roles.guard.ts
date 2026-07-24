import {
CanActivate,
ExecutionContext,
Injectable,
ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { UserRole } from 'src/users/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
constructor(private reflector: Reflector) {}

canActivate(context: ExecutionContext): boolean {
const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
ROLES_KEY,
[context.getHandler(), context.getClass()],
);
if (!requiredRoles) {
return true;
}
const { user } = context.switchToHttp().getRequest();
console.log('✅ user in RolesGuard:', user);
console.log('✅ RolesGuard - requiredRoles:', requiredRoles);
if (!user || !requiredRoles.includes(user.role)) {
throw new ForbiddenException('Access denied');
}
return true;
}
}