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
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../decorators/public.decorator';
import { UserContextInterceptor } from '../interceptors/user-context.interceptor';
import { Observable } from 'rxjs';
import { timeout, catchError } from 'rxjs/operators';
import { TimeoutError } from 'rxjs';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(UserContextInterceptor)
export class AuthController {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  @Public()
  @Post('login')
  login(@Body() loginData: any): Observable<any> {
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

  @Public()
  @Post('register')
  register(@Body() registerData: any): Observable<any> {
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
  updateProfile(@Request() req: any, @Body() updateData: any): Observable<any> {
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
  @ApiBearerAuth()
  @All('*')
  proxyAll(@Request() req: any, @Param('path') path: string, @Body() body: any): Observable<any> {
    // Include user info in the request if authenticated
    const payload = {
      ...body,
      user: req.user,
      path,
    };
    
    return this.authClient
      .send({ cmd: 'proxy', path }, payload)
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
}
