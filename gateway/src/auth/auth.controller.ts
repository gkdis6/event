import { 
  Body, 
  Controller, 
  Post, 
  Get, 
  Put,
  Delete,
  Param,
  Inject,
  UseGuards,
  HttpStatus,
  HttpException,
  All,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { UserContextInterceptor } from '../interceptors/user-context.interceptor';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError } from 'rxjs';
import { CreateUserDto } from '../dto/auth/create-user.dto';
import { UpdateUserDto } from '../dto/auth/update-user.dto';
import { LoginUserDto } from '../dto/auth/login-user.dto';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(UserContextInterceptor)
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Public()
  @Post('register')
  @ApiBody({ type: CreateUserDto, examples: {
    'standard': {
      summary: '회원가입 예시',
      value: { username: 'newuser', password: 'newpassword', email: 'newuser@example.com', role: 'USER' }
    },
    'admin': {
      summary: '관리자 회원가입 예시',
      value: { username: 'admin', password: 'admin123', email: 'admin@example.com', role: 'ADMIN' }
    },
  }})
  register(@Body() registerData: CreateUserDto): Observable<any> {
    return this.authClient
      .send({ cmd: 'register' }, registerData)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Auth service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Auth service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: '사용자 로그인',
    description: '사용자 인증 및 JWT 토큰 발급'
  })
  @ApiBody({
    type: LoginUserDto,
    description: '로그인 요청 데이터',
    examples: {
      'standard': {
        summary: '로그인 예시',
        description: '일반 사용자 로그인 예시',
        value: { username: 'newuser', password: 'newpassword' }
      },
      'admin': {
        summary: '관리자 로그인 예시',
        description: '관리자 계정 로그인',
        value: { username: 'admin', password: 'admin123' }
      }
    }
  })
  login(@Body() loginData: LoginUserDto): Observable<any> {
    return this.authClient
      .send({ cmd: 'login' }, loginData)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Auth service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Auth service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req: any): Observable<any> {
    return this.authClient
      .send({ cmd: 'get-profile' }, { userId: req.user.sub })
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Auth service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Auth service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  @ApiBearerAuth()
  @Put('profile')
  @ApiBody({ type: UpdateUserDto, examples: {
    'example': {
      summary: '프로필 업데이트 예시',
      value: { email: 'updated@example.com', newPassword: 'updatedpassword', isActive: true, roles: ['USER', 'ADMIN'] }
    }
  }})
  updateProfile(@Request() req: any, @Body() updateData: UpdateUserDto): Observable<any> {
    // Include user ID in the request data
    const data = {
      ...updateData,
      userId: req.user.sub,
    };
    return this.authClient
      .send({ cmd: 'update-profile' }, data)
      .pipe(
        timeout(5000),
        catchError(err => {
          if (err instanceof TimeoutError) {
            throw new HttpException('Auth service timeout', HttpStatus.GATEWAY_TIMEOUT);
          }
          throw new HttpException(err.message || 'Auth service error', HttpStatus.BAD_GATEWAY);
        })
      );
  }

  // Catch all other routes and proxy them to auth service
  // @ApiBearerAuth()
  // @All('*')
  // proxyAll(@Request() req: any, @Param('path') path: string, @Body() body: any): Observable<any> {
  //   // Include user info in the request if authenticated
  //   const payload = {
  //     ...body,
  //     user: req.user,
  //     path,
  //   };
    
  //   return this.authClient
  //     .send({ cmd: 'proxy', path }, payload)
  //     .pipe(
  //       timeout(5000),
  //       catchError(err => {
  //         if (err instanceof TimeoutError) {
  //           throw new HttpException('Auth service timeout', HttpStatus.GATEWAY_TIMEOUT);
  //         }
  //         throw new HttpException(err.message || 'Auth service error', HttpStatus.BAD_GATEWAY);
  //       })
  //     );
  // }
}
