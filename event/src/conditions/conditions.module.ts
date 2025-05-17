import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConditionValidatorFactory } from './factories/condition-validator.factory';
import { AttendanceDaysValidator } from './validators/attendance-days.validator';
import { MonsterKillValidator } from './validators/monster-kill.validator';

@Module({
  imports: [
    // 필요한 경우 스키마 등록
  ],
  providers: [
    ConditionValidatorFactory,
    AttendanceDaysValidator,
    MonsterKillValidator,
    // 다른 조건 검증기도 여기에 추가
  ],
  exports: [
    ConditionValidatorFactory
  ],
})
export class ConditionsModule {}
