import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/apis/user/schemas';

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ required: true })
  access_token: string;

  @Prop({ required: true })
  refresh_token: string;

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop()
  expired_at: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
