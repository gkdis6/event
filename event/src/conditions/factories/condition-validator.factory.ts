import { Injectable } from '@nestjs/common';
import { ConditionType } from '../../common/enums/condition-type.enum';
import { ConditionValidator } from '../interfaces/condition-validator.interface';
import { AttendanceDaysValidator } from '../validators/attendance-days.validator';
import { MonsterKillValidator } from '../validators/monster-kill.validator';

@Injectable()
export class ConditionValidatorFactory {
  constructor(
    private readonly attendanceDaysValidator: AttendanceDaysValidator,
    private readonly monsterKillValidator: MonsterKillValidator,
    // 다른 validator들도 여기에 추가
  ) {}

  /**
   * 조건 유형에 맞는 validator 반환
   */
  getValidator(conditionType: ConditionType): ConditionValidator {
    switch (conditionType) {
      case ConditionType.ATTENDANCE_DAYS:
        return this.attendanceDaysValidator;
      case ConditionType.MONSTER_KILL:
        return this.monsterKillValidator;
      // 다른 조건 유형도 여기에 추가
      default:
        throw new Error(`지원하지 않는 조건 타입: ${conditionType}`);
    }
  }
}
