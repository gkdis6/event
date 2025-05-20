import { Injectable } from '@nestjs/common';
import { ConditionValidator } from '../interfaces/condition-validator.interface';

@Injectable()
export class PlayTimeValidator implements ConditionValidator {
  constructor() {}

  /**
   * 사용자의 플레이 시간이 조건을 충족하는지 검증
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param conditionData 조건 데이터 (requiredHours: 필요 플레이 시간 (시간))
   */
  async validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    try {
      const { requiredHours } = conditionData;

      // 실제 구현에서는 사용자 플레이 시간 기록을 조회하여 requiredHours와 비교
      // 아래는 예시 코드입니다
      /*
      const playTimeInHours = await this.gameDataService.getPlayTime(userId, conditionData.startDate, conditionData.endDate);
      return playTimeInHours >= requiredHours;
      */

      // 테스트를 위한 임시 로직
      const randomValue = Math.random();
      return randomValue > 0.4; // 약 60% 확률로 조건 충족
    } catch (error) {
      console.error(`플레이 시간 검증 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  /**
   * 조건에 대한 사용자 친화적 설명 생성
   */
  getDescription(conditionData: any): string {
    const { requiredHours } = conditionData;
    return `접속 ${requiredHours}시간 달성`;
  }
}
