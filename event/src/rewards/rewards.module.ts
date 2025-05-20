import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardProcessorFactory } from './factories/reward-processor.factory';
import { CashPointProcessor } from './processors/cash-point.processor';
import { ItemProcessor } from './processors/item.processor'; // ItemProcessor 임포트
import { PhysicalProductProcessor } from './processors/physical-product.processor'; // PhysicalProductProcessor 임포트
import { CouponInternalProcessor } from './processors/coupon-internal.processor'; // CouponInternalProcessor 임포트
import { CouponExternalProcessor } from './processors/coupon-external.processor'; // CouponExternalProcessor 임포트
import { LotteryProcessor } from './processors/lottery.processor'; // LotteryProcessor 임포트
import { Reward, RewardSchema } from './schemas/reward.schema';
import { RewardRequest, RewardRequestSchema } from './schemas/reward-request.schema';
import { RewardsService } from './services/rewards.service'; // RewardsService 임포트
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
    forwardRef(() => EventsModule),
  ],
  providers: [
    RewardsService, // RewardsService 추가
    RewardProcessorFactory,
    CashPointProcessor,
    ItemProcessor, // ItemProcessor 추가
    PhysicalProductProcessor, // PhysicalProductProcessor 추가
    CouponInternalProcessor, // CouponInternalProcessor 추가
    CouponExternalProcessor, // CouponExternalProcessor 추가
    LotteryProcessor, // LotteryProcessor 추가
  ],
  exports: [
    MongooseModule,
    RewardProcessorFactory,
    RewardsService, // RewardsService export
  ],
})
export class RewardsModule {}
