import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  display_name: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  avatar?: string;

  @Prop({ required: true, default: false })
  is_active: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;

  @Prop({ required: true, default: Date.now })
  updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
