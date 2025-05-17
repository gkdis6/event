import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/services/users.service';
import { CreateUserDto } from '../../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 회원가입 처리
   */
  async register(createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * JWT 액세스 토큰 생성
   */
  async generateAccessToken(user: any) {
    const payload = {
      username: user.username,
      sub: user.id || user._id,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  /**
   * 로그인 처리
   */
  async login(user: any) {
    const accessToken = await this.generateAccessToken(user);

    return {
      accessToken,
      user: {
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    };
  }
}
