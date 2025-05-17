import { Controller, Get, All, Param, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './decorators/public.decorator';

@ApiTags('gateway')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: '게이트웨이 상태 확인' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @Public()
  @ApiOperation({ summary: '게이트웨이 헬스 체크' })
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        gateway: 'up',
      }
    };
  }

  /**
   * 모든 요청을 처리할 수 있는 폴백 라우트
   * 등록되지 않은 엔드포인트로의 요청은 여기서 처리됩니다.
   */
  @All('*')
  @Public()
  handleFallback(@Req() req: Request, @Res() res: Response, @Param('path') path: string) {
    // 접근 가능한 엔드포인트를 안내합니다
    return res.status(HttpStatus.NOT_FOUND).json({
      statusCode: HttpStatus.NOT_FOUND,
      timestamp: new Date().toISOString(),
      path: req.url,
      message: '요청하신 엔드포인트를 찾을 수 없습니다. 게이트웨이에 등록된 서비스를 이용해주세요.',
      availableEndpoints: [
        '/auth/* - 인증 관련 요청',
        '/events/* - 이벤트 관련 요청',
        '/health - 게이트웨이 상태 확인'
      ]
    });
  }
}
