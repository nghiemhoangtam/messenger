import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';

@Schema({ collection: 'social_accounts' })
export class SocialAccount extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  provider: string;

  @Prop({ required: true })
  provider_id: string;

  @Prop()
  access_token: string;

  @Prop()
  refresh_token: string;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const SocialAccountSchema = SchemaFactory.createForClass(SocialAccount);
