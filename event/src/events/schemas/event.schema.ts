import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ConditionType } from '../../common/enums/condition-type.enum';
import { EventStatus } from '../../common/enums/event-status.enum';

export type EventDocument = Event & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      return ret;
    },
    virtuals: true,
  },
  toObject: {
    virtuals: true,
    getters: true,
  },
})
export class Event {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(EventStatus),
    default: EventStatus.DRAFT,
  })
  status: EventStatus;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(ConditionType),
  })
  conditionType: ConditionType;

  @Prop({ type: Object, required: true })
  conditionData: any;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ default: false })
  isDeleted: boolean;

  // Mongoose document 가상 속성으로 _id를 id로 사용할 수 있게 함
  id: string;

  // 문서를 객체로 변환하는 메소드 (Mongoose 메소드)
  toObject?: () => any;
  save?: () => Promise<this>;
}

export const EventSchema = SchemaFactory.createForClass(Event);

// 가상속성 id 설정
EventSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
