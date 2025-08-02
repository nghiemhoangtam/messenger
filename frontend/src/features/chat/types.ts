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
}

export interface Message {
  id: string;
  room_id: string;
  sender: Contact;
  content: string;
  created_at: Date;
  status: "sent" | "delivered" | "read" | "failed";
  reply_to_id?: string;
  edited_at?: Date;
  edited_by?: string;
  encryption_key?: string;
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
  user_id: string;
  started_at: Date;
  expires_at: Date;
}

export interface UserPresence {
  id: string;
  user_id: string;
  status: "online" | "offline" | "away" | "busy";
  last_seen: Date;
  custom_status?: string;
  updated_at: Date;
}