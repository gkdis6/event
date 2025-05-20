import { Injectable } from '@nestjs/common';
import { ConditionValidator } from '../interfaces/condition-validator.interface';

@Injectable()
export class InviteFriendsValidator implements ConditionValidator {
  constructor() {}

  /**
   * 사용자가 친구 초대 조건을 충족했는지 검증
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param conditionData 조건 데이터 (requiredInvites: 필요 초대 수)
   */
  async validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    try {
      const { requiredInvites } = conditionData;

      // 실제 구현에서는 사용자 초대 기록을 조회하여 requiredInvites와 비교
      // 아래는 예시 코드입니다
      /*
      const inviteCount = await this.userService.getInviteCount(userId, eventId);
      return inviteCount >= requiredInvites;
      */

      // 테스트를 위한 임시 로직
      const userIdLength = userId.length;
      return userIdLength % 3 === 0; // userId 길이에 따라 임시 결과 반환
    } catch (error) {
      console.error(`친구 초대 검증 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  /**
   * 조건에 대한 사용자 친화적 설명 생성
   */
  getDescription(conditionData: any): string {
    const { requiredInvites } = conditionData;
    return `친구 ${requiredInvites}명 초대`;
  }
}
