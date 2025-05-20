import { Injectable } from '@nestjs/common';
import { RewardProcessor, RewardProcessResult } from '../interfaces/reward-processor.interface'; // RewardProcessResult 임포트

@Injectable()
export class ItemProcessor implements RewardProcessor {
  async process(userId: string, rewardData: any): Promise<RewardProcessResult> {
    // TODO: ITEM 보상 지급 로직 구현
    console.log(`Processing ITEM reward for user ${userId} with data:`, rewardData);
    // 실제 아이템 지급 로직 (예: 인벤토리에 아이템 추가 등)

    // 임시 구현: 항상 성공하고 간단한 메시지 반환
    return {
      success: true,
      message: `아이템 보상이 지급되었습니다. (User: ${userId})`,
      details: rewardData,
    };
  }

  getDescription(rewardData: any): string {
    // TODO: ITEM 보상 설명 생성 로직 구현
    // rewardData를 기반으로 사용자에게 표시할 보상 설명을 생성합니다.
    return `아이템: ${rewardData?.itemName || '알 수 없는 아이템'}`;
  }
}
