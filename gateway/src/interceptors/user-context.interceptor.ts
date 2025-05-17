import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 사용자 컨텍스트 전파용 인터셉터
 * 
 * HTTP 요청에서 추출한 사용자 정보를 마이크로서비스 호출 시 포함할 수 있도록 준비합니다.
 * 게이트웨이에서 인증된 사용자 정보를 각 마이크로서비스로 안전하게 전달하는 역할을 합니다.
 */
@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Add user context to request object for use in controllers when making microservice calls
    if (user) {
      // Prepare user context that can be accessed by controllers
      request.userContext = {
        userId: user.sub || user.id,
        username: user.username,
        email: user.email,
        roles: user.roles || [],
      };
      
      console.log(`Adding user context for user: ${request.userContext.userId}`);
    }

    return next.handle().pipe(
      tap(() => {
        // Post-request logic could be added here
      }),
    );
  }
}
