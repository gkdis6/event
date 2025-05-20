import { Controller, Inject } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AuthService } from '../services/auth.service';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginUserDto } from '../../users/dto/login-user.dto';

/**
 * 인증 마이크로서비스 컨트롤러
 * 
 * 게이트웨이로부터 오는 인증 관련 메시지 패턴을 처리합니다.
 * HTTP 요청이 아닌 TCP 통신을 통해 호출됩니다.
 */
@Controller()
export class AuthMsController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 로그인 처리
   * 게이트웨이의 'login' 메시지 패턴을 처리합니다.
   */
  @MessagePattern({ cmd: 'login' })
  async login(loginUserDto: LoginUserDto) {
    try {
      // 유효한 사용자 검증
      const user = await this.usersService.findOne(loginUserDto.username);
      
      if (!user) {
        return {
          success: false,
          message: '사용자명 또는 비밀번호가 올바르지 않습니다.',
          statusCode: 401,
        };
      }
      
      // 비밀번호 검증
      const isPasswordValid = await this.usersService.validatePassword(
        loginUserDto.password,
        user.password,
      );
      
      if (!isPasswordValid) {
        return {
          success: false,
          message: '사용자명 또는 비밀번호가 올바르지 않습니다.',
          statusCode: 401,
        };
      }
      
      // 로그인 처리 및 JWT 토큰 발급
      const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
      const result = await this.authService.login(userWithoutPassword);
      
      return {
        success: true,
        message: '로그인 성공',
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '로그인 처리 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }

  /**
   * 회원가입 처리
   * 게이트웨이의 'register' 메시지 패턴을 처리합니다.
   */
  @MessagePattern({ cmd: 'register' })
  async register(createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.register(createUserDto);
      const result = await this.authService.login(user);
      return {
        success: true,
        message: '계정이 성공적으로 생성되었습니다.',
        ...result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '회원가입 처리 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }

  /**
   * 사용자 프로필 조회
   * 게이트웨이의 'get-profile' 메시지 패턴을 처리합니다.
   */
  @MessagePattern({ cmd: 'get-profile' })
  async getProfile(data: { userId: string }) {
    try {
      const user = await this.usersService.findById(data.userId);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          statusCode: 404,
        };
      }
      
      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = user.toObject ? user.toObject() : user;
      
      return {
        success: true,
        message: '프로필 조회 성공',
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '프로필 조회 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }

  /**
   * 사용자 프로필 업데이트
   * 게이트웨이의 'update-profile' 메시지 패턴을 처리합니다.
   */
  @MessagePattern({ cmd: 'update-profile' })
  async updateProfile(data: { userId: string, [key: string]: any }) {
    try {
      const { userId, ...updateData } = data;
      const updatedUser = await this.usersService.update(userId, updateData);
      
      if (!updatedUser) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          statusCode: 404,
        };
      }
      
      // 비밀번호 제외하고 반환
      const { password: _, ...userWithoutPassword } = updatedUser.toObject ? updatedUser.toObject() : updatedUser;
      
      return {
        success: true,
        message: '프로필이 성공적으로 업데이트되었습니다.',
        user: userWithoutPassword
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '프로필 업데이트 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }

  /**
   * 사용자 역할 조회
   * @param data.userId 사용자 ID
   */
  @MessagePattern({ cmd: 'get-user-roles' })
  async getUserRoles(data: { userId: string }) {
    try {
      const user = await this.usersService.findById(data.userId);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
          statusCode: 404,
        };
      }

      return {
        success: true,
        message: '사용자 역할 조회 성공',
        roles: user.roles, // 사용자의 roles 속성 반환
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '사용자 역할 조회 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }

  /**
   * 기타 인증 관련 요청 처리
   * 게이트웨이의 'proxy' 메시지 패턴을 처리합니다.
   */
  @MessagePattern({ cmd: 'proxy' })
  async handleProxy(data: { path: string, user: any, [key: string]: any }) {
    try {
      const { path, ...payload } = data;
      
      // 추가 요청 경로에 따라 적절한 처리를 구현할 수 있습니다.
      // 예: 비밀번호 변경, 계정 삭제 등
      
      return {
        success: false,
        message: '지원되지 않는 작업입니다.',
        statusCode: 400,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '요청 처리 중 오류가 발생했습니다.',
        statusCode: error.status || 500,
      };
    }
  }
}
