import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';

@Schema({ collection: 'email_verification_tokens' })
export class EmailVerificationToken extends Document {
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

export const EmailVerificationTokenSchema = SchemaFactory.createForClass(
  EmailVerificationToken,
);
