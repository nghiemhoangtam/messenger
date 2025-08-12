import { PaginationResponse } from "../../types/pagination-response";
import { Contact } from "../contacts/types";

export interface Room {
  id: string;
  name: string;
  type: string;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  created_by_id: string;
  description?: string;
  max_members?: number;
  is_encrypted?: boolean;
  last_message_at?: Date;
  pinned_message_id?: string;
  memberPage: PaginationResponse<Contact>;
  messagePage: PaginationResponse<Message>;
  isActive?: boolean;
  activityLevel?: 'high' | 'medium' | 'low' | 'inactive';
}

export interface ReplyMessage {
  id: string;
  content: string;
  type: string;
  sender: Contact;
  created_at: Date;
}

export interface Message {
  id: string;
  room_id: string;
  sender: Contact;
  content: string;
  created_at: Date;
  status: "sent" | "delivered" | "read" | "failed";
  reply_to_id?: string;
  reply_to?: ReplyMessage;
  edited_at?: Date;
  edited_by?: string;
  encryption_key?: string;
  type?: string;
}

export interface Conversation {
  room: Room;
  lastMessage?: Message;
  unread_count: number;
}

export interface CreateGroupRoomRequest {
  name: string;
  members: string[];
  description?: string;
  max_members?: number;
  is_encrypted?: boolean;
}

export interface MessageThread {
  id: string;
  parent_message_id: string;
  root_message_id: string;
  thread_id?: string;
  created_at: Date;
}

export interface MessageMention {
  id: string;
  message_id: string;
  mentioned_user_id: string;
  mention_type: "user" | "role" | "all";
  created_at: Date;
}

export interface TypingIndicator {
  id: string;
  room_id: string;
  user: Contact;
  started_at: string | number; // ISO string or timestamp
  expires_at: number; // timestamp
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: "online" | "offline" | "away" | "busy";
  last_seen: Date;
  custom_status?: string;
  updated_at: Date;
}

export interface RoomActivity {
  user_id: Contact;
  status: "online" | "offline" | "away" | "busy";
  last_seen: Date;
  joined_at: Date;
}

export interface RoomActivitySummary {
  total_members: number;
  online_users: number;
  offline_users: number;
  away_users: number;
  busy_users: number;
}

export interface RoomActivityState {
  room_id: string;
  online_count: number;
  total_members: number;
  away_count: number;
  busy_count: number;
  offline_count: number;
  is_active?: boolean;
  activity_level?: 'high' | 'medium' | 'low' | 'inactive';
}

export interface RoomOnlineUsers {
  [roomId: string]: string[];
}