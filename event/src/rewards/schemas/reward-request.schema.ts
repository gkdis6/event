import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RequestStatus } from '../../common/enums/request-status.enum';

export type RewardRequestDocument = RewardRequest & Document;

@Schema({
  timestamps: true,
  collection: 'reward_requests',
})
export class RewardRequest {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Event',
  })
  eventId: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: true,
    ref: 'Reward',
  })
  rewardId: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({
    type: String,
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Prop()
  validationResult: boolean;

  @Prop()
  processingResult: boolean;

  @Prop()
  referenceId: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  resultDetails: Record<string, any>;

  @Prop()
  rejectionReason: string;

  @Prop()
  processedAt: Date;

  @Prop()
  processedBy: string;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);

// 인덱스 추가
RewardRequestSchema.index({ eventId: 1 });
RewardRequestSchema.index({ userId: 1 });
RewardRequestSchema.index({ status: 1 });
RewardRequestSchema.index({ userId: 1, eventId: 1, rewardId: 1 }, { unique: true });
RewardRequestSchema.index({ createdAt: -1 });
