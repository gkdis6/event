import { Injectable } from '@nestjs/common';
import { ConditionType } from '../../common/enums/condition-type.enum';
import { ConditionValidator } from '../interfaces/condition-validator.interface';
import { AttendanceDaysValidator } from '../validators/attendance-days.validator';
import { MonsterKillValidator } from '../validators/monster-kill.validator';
import { InviteFriendsValidator } from '../validators/invite-friends.validator'; // InviteFriendsValidator 임포트
import { PlayTimeValidator } from '../validators/play-time.validator'; // PlayTimeValidator 임포트
import { DefeatBossWeeklyValidator } from '../validators/defeat-boss-weekly.validator'; // DefeatBossWeeklyValidator 임포트
import { VipOnlyValidator } from '../validators/vip-only.validator'; // VipOnlyValidator 임포트

@Injectable()
export class ConditionValidatorFactory {
  constructor(
    private readonly attendanceDaysValidator: AttendanceDaysValidator,
    private readonly monsterKillValidator: MonsterKillValidator,
    private readonly inviteFriendsValidator: InviteFriendsValidator, // InviteFriendsValidator 주입
    private readonly playTimeValidator: PlayTimeValidator, // PlayTimeValidator 주입
    private readonly defeatBossWeeklyValidator: DefeatBossWeeklyValidator, // DefeatBossWeeklyValidator 주입
    private readonly vipOnlyValidator: VipOnlyValidator, // VipOnlyValidator 주입
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
      case ConditionType.INVITE_FRIENDS: // INVITE_FRIENDS 유형 처리
        return this.inviteFriendsValidator;
      case ConditionType.PLAY_TIME: // PLAY_TIME 유형 처리
        return this.playTimeValidator;
      case ConditionType.DEFEAT_BOSS_WEEKLY: // DEFEAT_BOSS_WEEKLY 유형 처리
        return this.defeatBossWeeklyValidator;
      // case ConditionType.VIP_ONLY: // VIP_ONLY 유형 처리
      //   return this.vipOnlyValidator;
      default:
        throw new Error(`지원하지 않는 조건 타입: ${conditionType}`);
    }
  }
}
