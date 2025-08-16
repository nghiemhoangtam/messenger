import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './users.schema';

@Schema({ collection: 'user_settings' })
export class UserSetting extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: false })
  dark_mode: boolean;

  @Prop({ required: true, default: 'vi' })
  language: string;

  @Prop({ required: true, default: true })
  notification_enabled: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
