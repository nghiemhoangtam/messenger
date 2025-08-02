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
  memberPage: PaginationResponse<Contact>;
  messagePage: PaginationResponse<Message>;
}

export interface Message {
  id: string;
  room_id: string;
  sender: Contact;
  content: string;
  created_at: Date;
  status: "sent" | "delivered" | "read";
}

export interface Conversation {
  room: Room;
  lastMessage?: Message;
  unread_count: number;
}

export interface CreateGroupRoomRequest {
  name: string;
  members: string[];
}