import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable, of, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * 권한 검증 서비스
 * 
 * 이벤트 서비스에 대한 접근 권한을 인증 서비스에 확인하는 서비스입니다.
 * 게이트웨이는 이 서비스를 통해 인증 서비스에 권한 검증을 요청합니다.
 */
@Injectable()
export class PermissionService {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  /**
   * 사용자의 특정 리소스 접근 권한을 검증합니다.
   * 
   * @param userId 사용자 ID
   * @param path 접근하려는 경로
   * @param method HTTP 메소드
   * @param roles 사용자 역할
   * @returns 권한 검증 결과
   */
  validatePermission(
    userId: string,
    path: string,
    method: string,
    roles: string[] = [],
  ): Observable<any> {
    // 인증 서비스에 권한 검증 요청
    return this.authClient
      .send(
        { cmd: 'validate-permission' },
        { userId, path, method, roles }
      )
      .pipe(
        timeout(5000),
        catchError(err => {
          console.error(`Permission validation error: ${err.message}`);
          // 인증 서비스에 오류가 발생한 경우, 기본적으로 권한 없음 처리
          // 실제 운영에서는 정책에 따라 다르게 처리할 수 있음
          return of({ hasPermission: false, message: '권한 검증 중 오류가 발생했습니다' });
        })
      );
  }
}
