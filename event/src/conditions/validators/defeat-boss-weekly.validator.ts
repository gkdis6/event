import { Injectable } from '@nestjs/common';
import { ConditionValidator } from '../interfaces/condition-validator.interface';

@Injectable()
export class DefeatBossWeeklyValidator implements ConditionValidator {
  constructor() {}

  /**
   * 사용자가 주간 보스 처치 조건을 충족했는지 검증
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param conditionData 조건 데이터 (bossId: 보스 ID, requiredWeeks: 필요 연속 주차)
   */
  async validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    try {
      const { bossId, requiredWeeks } = conditionData;

      // 실제 구현에서는 사용자 주간 보스 처치 기록을 조회하여 requiredWeeks와 비교
      // 아래는 예시 코드입니다
      /*
      const consecutiveWeeks = await this.gameDataService.getConsecutiveBossDefeats(userId, bossId);
      return consecutiveWeeks >= requiredWeeks;
      */

      // 테스트를 위한 임시 로직
      const userIdHash = userId.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
      return userIdHash % 4 === 0; // 약 25% 확률로 조건 충족
    } catch (error) {
      console.error(`주간 보스 처치 검증 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  /**
   * 조건에 대한 사용자 친화적 설명 생성
   */
  getDescription(conditionData: any): string {
    const { bossName, requiredWeeks } = conditionData;
    return `${bossName || '주간 보스'} ${requiredWeeks}주 연속 처치`;
  }
}
