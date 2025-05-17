import { Injectable } from '@nestjs/common';
import { ConditionValidator } from '../interfaces/condition-validator.interface';

@Injectable()
export class MonsterKillValidator implements ConditionValidator {
  constructor() {}

  /**
   * 사용자가 몬스터 처치 조건을 충족했는지 검증
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param conditionData 조건 데이터 (monsterId: 몬스터 ID, requiredKills: 필요 처치 수)
   */
  async validate(userId: string, eventId: string, conditionData: any): Promise<boolean> {
    try {
      const { monsterId, requiredKills } = conditionData;

      // 실제 구현에서는 게임 DB에서 해당 사용자의 몬스터 처치 기록을 조회
      // 아래는 예시 코드입니다
      /*
      const killCount = await this.gameDataService.getMonsterKillCount(
        userId, 
        monsterId, 
        conditionData.startDate, 
        conditionData.endDate
      );

      return killCount >= requiredKills;
      */
      
      // 테스트를 위한 임시 로직
      const userIdSum = userId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
      return userIdSum % 5 < 3; // 약 60% 확률로 조건 충족
    } catch (error) {
      console.error(`몬스터 처치 검증 중 오류 발생: ${error.message}`);
      return false;
    }
  }

  /**
   * 조건에 대한 사용자 친화적 설명 생성
   */
  getDescription(conditionData: any): string {
    const { monsterName, requiredKills } = conditionData;
    return `${monsterName || '특정 몬스터'} ${requiredKills}마리 처치`;
  }
}
