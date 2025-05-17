import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 메타데이터에서 필요한 역할을 가져옵니다
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 역할이 지정되지 않은 경우 접근을 허용합니다
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    // 사용자가 없으면 접근을 거부합니다
    if (!user) {
      return false;
    }

    // ADMIN은 모든 권한을 가집니다
    if (user.role === Role.ADMIN) {
      return true;
    }

    // 요청된 역할 중 하나라도 사용자가 가지고 있으면 접근을 허용합니다
    return requiredRoles.some((role) => user.role === role);
  }
}
