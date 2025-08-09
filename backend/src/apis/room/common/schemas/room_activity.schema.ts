import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ collection: 'room_activity' })
export class RoomActivity extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Room', required: true })
  room_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ required: true, default: 'offline' })
  status: 'online' | 'offline' | 'away' | 'busy';

  @Prop({ required: true, default: Date.now })
  last_seen: Date;

  @Prop({ required: true, default: Date.now })
  joined_at: Date;

  @Prop()
  left_at: Date;

  @Prop({ required: true, default: Date.now })
  updated_at: Date;
}

export const RoomActivitySchema = SchemaFactory.createForClass(RoomActivity);

// Create compound index for room_id and user_id
RoomActivitySchema.index({ room_id: 1, user_id: 1 }, { unique: true });

// Create index for room_id for faster queries
RoomActivitySchema.index({ room_id: 1 });

// Create index for user_id for faster queries
RoomActivitySchema.index({ user_id: 1 });
