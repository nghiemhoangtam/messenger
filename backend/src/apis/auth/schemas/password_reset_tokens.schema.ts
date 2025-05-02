import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';

@Schema({ collection: 'password_reset_token' })
export class PasswordResetToken extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true, default: false })
  is_used: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop()
  expired_at: Date;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);
