import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RewardType } from '../../common/enums/reward-type.enum';

export type RewardDocument = Reward & Document;

@Schema({
  timestamps: true,
  collection: 'rewards',
})
export class Reward {
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true,
    ref: 'Event'
  })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    enum: RewardType,
    required: true,
  })
  type: RewardType;

  @Prop({
    type: MongooseSchema.Types.Mixed,
    required: true,
  })
  rewardData: Record<string, any>;

  @Prop({ default: 1 })
  quantity: number;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);

// 인덱스 추가
RewardSchema.index({ eventId: 1 });
RewardSchema.index({ type: 1 });
RewardSchema.index({ isDeleted: 1 });
