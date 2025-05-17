import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { PermissionService } from './permission.service';

/**
 * 권한 컨트롤러
 * 
 * 게이트웨이로부터 오는 권한 검증 요청을 처리합니다.
 */
@Controller()
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  /**
   * 사용자의 특정 리소스 접근 권한을 검증합니다.
   * 게이트웨이의 AuthCheckInterceptor에서 호출됩니다.
   */
  @MessagePattern({ cmd: 'validate-permission' })
  validatePermission(data: { 
    userId: string; 
    path: string; 
    method: string; 
    roles: string[];
  }) {
    return this.permissionService.validatePermission(
      data.userId,
      data.path,
      data.method,
      data.roles,
    );
  }
}
