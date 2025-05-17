import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { LoginUserDto } from '../../users/dto/login-user.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 회원가입
   */
  @Post('register')
  @ApiOperation({ summary: '회원가입', description: '새 계정을 생성합니다' })
  @ApiResponse({ status: 201, description: '계정이 성공적으로 생성되었습니다', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 409, description: '이메일 주소가 이미 사용 중입니다' })
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.authService.register(createUserDto);
    const result = await this.authService.login(user);
    return {
      message: '계정이 성공적으로 생성되었습니다',
      ...result
    };
  }

  /**
   * 로그인
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOperation({ summary: '로그인', description: '자격 증명을 사용하여 로그인합니다' })
  @ApiResponse({ status: 200, description: '로그인 성공', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: '인증 실패' })
  async login(@Body() loginUserDto: LoginUserDto, @Request() req) {
    return {
      message: '로그인 성공',
      ...await this.authService.login(req.user)
    };
  }

  /**
   * 현재 사용자 정보 조회
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '프로필 조회', description: '현재 로그인한 사용자의 프로필을 조회합니다' })
  @ApiResponse({ status: 200, description: '프로필 조회 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getProfile(@Request() req) {
    return {
      message: '프로필 조회 성공',
      user: req.user
    };
  }
}
