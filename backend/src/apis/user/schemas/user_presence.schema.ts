import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'user_presence' })
export class UserPresence extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: 'offline' })
  status: 'online' | 'offline' | 'away' | 'busy';

  @Prop({ required: true, default: Date.now })
  last_seen: Date;

  @Prop()
  custom_status: string;

  @Prop({ required: true, default: Date.now })
  updated_at: Date;
}

export const UserPresenceSchema = SchemaFactory.createForClass(UserPresence); 