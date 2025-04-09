import { User } from "../auth/types";

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: string;
  createdAt: Date;
  status: "sent" | "delivered" | "read";
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
