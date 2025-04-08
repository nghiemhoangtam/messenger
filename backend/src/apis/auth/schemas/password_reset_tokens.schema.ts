import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';

@Schema({ timestamps: true })
export class PasswordResetToken extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  provider_id: string;

  @Prop({ required: true })
  access_token: string;

  @Prop({ required: true })
  refresh_token: string;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const PasswordResetTokenSchema =
  SchemaFactory.createForClass(PasswordResetToken);
