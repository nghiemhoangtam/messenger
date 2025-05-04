import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class Room extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: 'private' | 'group';

  @Prop({ required: true, default: false })
  is_active: boolean;

  @Prop({ required: true, default: Date.now })
  created_at: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
