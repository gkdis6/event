import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../common/enums/role.enum';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (_, ret) => {
      delete ret.password;
      return ret;
    },
    virtuals: true,
  },
  toObject: {
    virtuals: true,
    getters: true,
  },
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, default: [Role.USER] })
  roles: Role[];

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  refreshToken?: string;

  // Mongoose document 가상 속성으로 _id를 id로 사용할 수 있게 함
  id: string;

  // Document 객체를 간단한 객체로 변환하는 helper 함수 추가
  toObject?: () => any;
}

export const UserSchema = SchemaFactory.createForClass(User);

// 가상속성 id 설정
UserSchema.virtual('id').get(function() {
  return this._id.toHexString();
});
