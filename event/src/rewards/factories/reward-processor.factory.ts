import { Injectable } from '@nestjs/common';
import { RewardType } from '../../common/enums/reward-type.enum';
import { RewardProcessor } from '../interfaces/reward-processor.interface';
import { CashPointProcessor } from '../processors/cash-point.processor';
import { ItemProcessor } from '../processors/item.processor'; // ItemProcessor 임포트
import { PhysicalProductProcessor } from '../processors/physical-product.processor'; // PhysicalProductProcessor 임포트
import { CouponInternalProcessor } from '../processors/coupon-internal.processor'; // CouponInternalProcessor 임포트
import { CouponExternalProcessor } from '../processors/coupon-external.processor'; // CouponExternalProcessor 임포트
import { LotteryProcessor } from '../processors/lottery.processor'; // LotteryProcessor 임포트

@Injectable()
export class RewardProcessorFactory {
  constructor(
    private readonly cashPointProcessor: CashPointProcessor,
    private readonly itemProcessor: ItemProcessor, // ItemProcessor 주입
    private readonly physicalProductProcessor: PhysicalProductProcessor, // PhysicalProductProcessor 주입
    private readonly couponInternalProcessor: CouponInternalProcessor, // CouponInternalProcessor 주입
    private readonly couponExternalProcessor: CouponExternalProcessor, // CouponExternalProcessor 주입
    private readonly lotteryProcessor: LotteryProcessor, // LotteryProcessor 주입
  ) {}

  /**
   * 보상 유형에 맞는 프로세서 반환
   */
  getProcessor(rewardType: RewardType): RewardProcessor {
    switch (rewardType) {
      case RewardType.CASH_POINT:
        return this.cashPointProcessor;
      case RewardType.ITEM: // ITEM 유형 처리
        return this.itemProcessor;
      case RewardType.PHYSICAL_PRODUCT: // PHYSICAL_PRODUCT 유형 처리
        return this.physicalProductProcessor;
      case RewardType.COUPON_INTERNAL: // COUPON_INTERNAL 유형 처리
        return this.couponInternalProcessor;
      case RewardType.COUPON_EXTERNAL: // COUPON_EXTERNAL 유형 처리
        return this.couponExternalProcessor;
      case RewardType.LOTTERY: // LOTTERY 유형 처리
        return this.lotteryProcessor;
      default:
        throw new Error(`지원하지 않는 보상 타입: ${rewardType}`);
    }
  }
}
