import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RewardProcessorFactory } from './factories/reward-processor.factory';
import { CashPointProcessor } from './processors/cash-point.processor';
import { Reward, RewardSchema } from './schemas/reward.schema';
import { RewardRequest, RewardRequestSchema } from './schemas/reward-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
  ],
  providers: [
    RewardProcessorFactory,
    CashPointProcessor,
    // 다른 보상 프로세서도 여기에 추가
  ],
  exports: [
    MongooseModule,
    RewardProcessorFactory,
  ],
})
export class RewardsModule {}
