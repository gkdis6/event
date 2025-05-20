import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConditionValidatorFactory } from './factories/condition-validator.factory';
import { AttendanceDaysValidator } from './validators/attendance-days.validator';
import { MonsterKillValidator } from './validators/monster-kill.validator';
import { InviteFriendsValidator } from './validators/invite-friends.validator'; // InviteFriendsValidator 임포트
import { PlayTimeValidator } from './validators/play-time.validator'; // PlayTimeValidator 임포트
import { DefeatBossWeeklyValidator } from './validators/defeat-boss-weekly.validator'; // DefeatBossWeeklyValidator 임포트
import { VipOnlyValidator } from './validators/vip-only.validator'; // VipOnlyValidator 임포트
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices'; // Microservices 클라이언트 모듈 임포트
import { ConfigModule, ConfigService } from '@nestjs/config'; // ConfigModule, ConfigService 임포트

@Module({
  imports: [
    ConfigModule, // 환경 변수 사용을 위해 ConfigModule 임포트
    ClientsModule.registerAsync([ // 클라이언트 모듈 비동기 등록
      {
        name: 'AUTH_SERVICE', // 클라이언트 토큰 이름
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.TCP, // TCP 전송 계층 사용
          options: {
            host: configService.get<string>('AUTH_SERVICE_HOST', 'auth'), // auth 서비스 호스트 (환경 변수 또는 기본값)
            port: configService.get<number>('AUTH_SERVICE_PORT', 3104), // auth 서비스 포트 (환경 변수 또는 기본값)
          },
        }),
      },
    ]),
    // 필요한 경우 스키마 등록
  ],
  providers: [
    ConditionValidatorFactory,
    AttendanceDaysValidator,
    MonsterKillValidator,
    InviteFriendsValidator, // InviteFriendsValidator 추가
    PlayTimeValidator, // PlayTimeValidator 추가
    DefeatBossWeeklyValidator, // DefeatBossWeeklyValidator 추가
    VipOnlyValidator, // VipOnlyValidator 추가
  ],
  exports: [
    ConditionValidatorFactory,
  ],
})
export class ConditionsModule {}
