import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // 핸들러나 컨트롤러에 설정된 필요 역할들을 가져옵니다.
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 역할 제약이 없으면 접근 허용
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Request에서 user 객체를 가져옵니다 (JwtAuthGuard에서 설정됨)
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new UnauthorizedException('사용자 인증 정보가 없습니다');
    }

    // 사용자가 필요한 역할을 가지고 있는지 확인합니다.
    const hasRequiredRole = requiredRoles.some(role => user.roles?.includes(role));
    if (!hasRequiredRole) {
      throw new UnauthorizedException('이 작업을 수행할 권한이 없습니다');
    }

    return true;
  }
}
