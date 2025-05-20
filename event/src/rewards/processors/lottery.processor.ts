import { Injectable } from '@nestjs/common';
import { RewardProcessor, RewardProcessResult } from '../interfaces/reward-processor.interface';

@Injectable()
export class LotteryProcessor implements RewardProcessor {
  async process(userId: string, rewardData: any): Promise<RewardProcessResult> {
    // TODO: LOTTERY 보상 지급 로직 구현 (추첨 기회 부여)
    console.log(`Processing LOTTERY reward for user ${userId} with data:`, rewardData);
    // 실제 추첨 기회 부여 로직 (예: 사용자에게 추첨권 개수 추가 등)

    // 임시 구현: 항상 성공하고 간단한 메시지 반환
    return {
      success: true,
      message: `추첨 기회가 지급되었습니다. (User: ${userId})`,
      details: rewardData,
    };
  }

  getDescription(rewardData: any): string {
    // TODO: LOTTERY 보상 설명 생성 로직 구현
    // rewardData를 기반으로 사용자에게 표시할 보상 설명을 생성합니다.
    return `추첨 기회: ${rewardData?.chances || '알 수 없는 횟수'} 회`;
  }
}
