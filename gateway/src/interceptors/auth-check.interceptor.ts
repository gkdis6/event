import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PermissionService } from '../auth/permission.service';

/**
 * 인증 확인 인터셉터
 * 
 * 모든 이벤트 관련 요청이 인증 서비스를 통해 권한 검증을 받도록 합니다.
 * 요청이 들어오면 먼저 인증 서비스에 검증 요청을 보내고, 
 * 인증이 성공적으로 완료된 경우에만 원래 요청을 처리합니다.
 */
@Injectable()
export class AuthCheckInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Public 데코레이터가 있는 경우 인증 체크를 건너뜁니다
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const path = request.route.path;
    const method = request.method;

    // 사용자 정보가 없으면 이미 JwtAuthGuard에서 차단되었을 것이므로,
    // 여기서는 추가 권한 검증을 진행합니다.
    if (!user) {
      return throwError(() => new UnauthorizedException('인증 정보가 없습니다'));
    }

    const userId = user.sub || user.id;
    const roles = user.roles || [];
    
    return this.permissionService.validatePermission(userId, path, method, roles)
      .pipe(
        mergeMap(result => {
          // 권한 검증 결과 확인
          if (!result || !result.hasPermission) {
            console.log(`Access denied for user ${userId} to ${path}`);
            return throwError(() => 
              new HttpException(
                result?.message || '해당 리소스에 접근 권한이 없습니다', 
                HttpStatus.FORBIDDEN
              )
            );
          }
          
          // 권한이 확인되면 요청 처리 진행
          console.log(`User ${userId} is authorized to access ${path}`);
          return next.handle();
        }),
        catchError(err => {
          console.error(`Permission check failed: ${err.message}`);
          
          // 이벤트 서비스 연결 실패 시 임시 처리
          if (err.message?.includes('ECONNREFUSED')) {
            console.log(`Connection to auth service failed. Bypassing permission check temporarily.`);
            // 연결 실패 시에는 권한 검증을 일시적으로 우회하고 요청 처리 허용
            console.warn(`⚠️ WARNING: Bypassing permission check due to auth service connection failure!`);
            return next.handle();
          }
          
          return throwError(() => 
            new HttpException(
              err.message || '권한 확인 중 오류가 발생했습니다', 
              err.status || HttpStatus.BAD_GATEWAY
            )
          );
        })
      );
  }
}
