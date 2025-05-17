import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { EventController } from './event.controller';
import { AuthCheckInterceptor } from '../interceptors/auth-check.interceptor';
import { AuthModule } from '../auth/auth.module';

/**
 * 이벤트 모듈
 * 
 * 이벤트와 보상 관련 요청을 이벤트 마이크로서비스로 라우팅합니다.
 * 모든 요청은 먼저 인증 서비스에서 권한 검사를 통과해야 합니다.
 */
@Module({
  imports: [
    AuthModule, // Import AuthModule to access PermissionService
    ClientsModule.registerAsync([
      {
        name: 'EVENT_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: configService.get('EVENT_SERVICE_HOST', 'event'),
            port: configService.get('EVENT_SERVICE_PORT', 3005),
          },
        }),
      },
    ]),
  ],
  controllers: [EventController],
  providers: [AuthCheckInterceptor],
  exports: [ClientsModule],
})
export class EventModule {}
