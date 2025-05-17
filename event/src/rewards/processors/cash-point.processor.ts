import { Injectable } from '@nestjs/common';
import { RewardProcessor, RewardProcessResult } from '../interfaces/reward-processor.interface';

@Injectable()
export class CashPointProcessor implements RewardProcessor {
  constructor() {}

  /**
   * 캐시 포인트 보상 처리
   * @param userId 사용자 ID
   * @param rewardData 보상 데이터 (amount: 지급할 포인트 양)
   */
  async process(userId: string, rewardData: any): Promise<RewardProcessResult> {
    try {
      const { amount } = rewardData;
      
      // 실제 구현에서는 외부 결제 시스템이나 포인트 서비스와 통합
      // 아래는 예시 코드입니다
      /*
      const transaction = await this.paymentService.addPoints(userId, amount, {
        source: 'event_reward',
        reference: rewardData.eventId,
        description: this.getDescription(rewardData)
      });

      return {
        success: true,
        referenceId: transaction.id,
        details: {
          previousBalance: transaction.previousBalance,
          newBalance: transaction.newBalance,
          amount: amount
        }
      };
      */
      
      // 테스트용 임시 구현
      const transactionId = `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      return {
        success: true,
        referenceId: transactionId,
        message: `${amount} 포인트가 성공적으로 지급되었습니다.`,
        details: {
          previousBalance: 1000, // 가상 데이터
          newBalance: 1000 + amount,
          amount: amount
        }
      };
    } catch (error) {
      console.error(`포인트 지급 중 오류 발생: ${error.message}`);
      return {
        success: false,
        message: '포인트 지급 실패: ' + error.message
      };
    }
  }

  /**
   * 보상 설명 생성
   */
  getDescription(rewardData: any): string {
    const { amount } = rewardData;
    return `${amount} 캐시 포인트`;
  }
}
