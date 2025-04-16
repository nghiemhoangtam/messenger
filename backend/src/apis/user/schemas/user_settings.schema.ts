import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './users.schema';

@Schema()
export class UserSetting extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true, default: false })
  dark_mode: boolean;

  @Prop({ required: true, default: 'vi' })
  language: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
