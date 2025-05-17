import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UsersService } from '../users/services/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    // 사용자명으로 사용자 조회
    const user = await this.usersService.findOne(username).catch(() => {
      throw new UnauthorizedException('유효하지 않은 인증 정보입니다');
    });

    if (!user) {
      throw new UnauthorizedException('유효하지 않은 인증 정보입니다');
    }

    // 비밀번호 검증
    const isPasswordValid = await this.usersService.validatePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('유효하지 않은 인증 정보입니다');
    }

    // 응답에서 비밀번호 제거
    const { password: _, ...result } = user.toObject ? user.toObject() : user;
    
    return result;
  }
}
