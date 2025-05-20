import { Injectable } from '@nestjs/common';
import { RewardProcessor, RewardProcessResult } from '../interfaces/reward-processor.interface';

@Injectable()
export class PhysicalProductProcessor implements RewardProcessor {
  async process(userId: string, rewardData: any): Promise<RewardProcessResult> {
    // TODO: PHYSICAL_PRODUCT 보상 지급 로직 구현
    console.log(`Processing PHYSICAL_PRODUCT reward for user ${userId} with data:`, rewardData);
    // 실제 실물 상품 지급 로직 (예: 배송 정보 확인, 배송 시스템 연동 등)

    // 임시 구현: 항상 성공하고 간단한 메시지 반환
    return {
      success: true,
      message: `실물 상품 보상이 지급되었습니다. (User: ${userId})`,
      details: rewardData,
    };
  }

  getDescription(rewardData: any): string {
    // TODO: PHYSICAL_PRODUCT 보상 설명 생성 로직 구현
    // rewardData를 기반으로 사용자에게 표시할 보상 설명을 생성합니다.
    return `실물 상품: ${rewardData?.productName || '알 수 없는 상품'}`;
  }
}
