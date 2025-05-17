import { Injectable } from '@nestjs/common';
import { RewardType } from '../../common/enums/reward-type.enum';
import { RewardProcessor } from '../interfaces/reward-processor.interface';
import { CashPointProcessor } from '../processors/cash-point.processor';

@Injectable()
export class RewardProcessorFactory {
  constructor(
    private readonly cashPointProcessor: CashPointProcessor,
    // 다른 프로세서들도 여기에 추가
  ) {}

  /**
   * 보상 유형에 맞는 프로세서 반환
   */
  getProcessor(rewardType: RewardType): RewardProcessor {
    switch (rewardType) {
      case RewardType.CASH_POINT:
        return this.cashPointProcessor;
      // 다른 보상 유형도 여기에 추가
      default:
        throw new Error(`지원하지 않는 보상 타입: ${rewardType}`);
    }
  }
}
