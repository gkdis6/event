import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { Role } from '../../common/enums/role.enum';

/**
 * 권한 검증 서비스
 * 
 * 사용자가 특정 리소스에 접근할 권한이 있는지 검증합니다.
 */
@Injectable()
export class PermissionService {
  constructor(private readonly usersService: UsersService) {}

  /**
   * 사용자의 권한을 확인하여 특정 경로에 대한 접근 권한이 있는지 검증합니다.
   * 
   * @param userId 사용자 ID
   * @param path 접근하려는 경로
   * @param method HTTP 메소드
   * @param userRoles 사용자 역할
   * @returns 권한 검증 결과
   */
  async validatePermission(
    userId: string,
    path: string,
    method: string,
    userRoles: string[] = [],
  ): Promise<{ hasPermission: boolean; message?: string }> {
    try {
      // 1. 사용자가 존재하고 활성화된 상태인지 확인
      const user = await this.usersService.findOne(userId);
      if (!user) {
        return { 
          hasPermission: false, 
          message: '존재하지 않는 사용자입니다.' 
        };
      }
      
      if (!user.isActive) {
        return { 
          hasPermission: false, 
          message: '비활성화된 계정입니다.' 
        };
      }

      // 2. 이벤트 관련 API에 대한 권한 검증
      if (path.startsWith('/events')) {
        // 기본적으로 모든 사용자가 이벤트 조회 가능
        if (method === 'GET') {
          return { hasPermission: true };
        }
        
        // 이벤트 보상 요청은 일반 사용자도 가능
        if (path.includes('/rewards/request') && method === 'POST') {
          return { hasPermission: true };
        }
        
        // 나머지 이벤트 관리 API는 관리자 권한 필요
        const hasAdminRole = 
          userRoles.includes(Role.ADMIN) || 
          user.roles?.includes(Role.ADMIN);
          
        if (!hasAdminRole) {
          return { 
            hasPermission: false, 
            message: '이벤트 관리는 관리자 권한이 필요합니다.' 
          };
        }
      }
      
      // 3. 기타 경로에 대한 권한 검증 로직
      // 필요에 따라 여기에 추가 권한 검증 로직 구현
      
      // 기본적으로 권한 허용
      return { hasPermission: true };
    } catch (error) {
      console.error(`Permission validation error: ${error.message}`);
      return { 
        hasPermission: false, 
        message: '권한 검증 중 오류가 발생했습니다.' 
      };
    }
  }
}
