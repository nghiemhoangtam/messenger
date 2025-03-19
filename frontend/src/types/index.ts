export interface User {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
    status: 'online' | 'offline' | 'away';
    lastSeen?: string;
    createdAt: string;
    updatedAt: string;
}

export interface GroupMember {
    userId: string;
    username: string;
    avatar: string | null;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
}

export interface Group {
    id: string;
    name: string;
    description?: string;
    avatar: string | null;
    type: 'public' | 'private';
    members: GroupMember[];
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'file' | 'audio' | 'video';
    status: 'sent' | 'delivered' | 'read';
    createdAt: string;
}

export interface Conversation {
    id: string;
    name: string;
    type: 'private' | 'group';
    avatar: string | null;
    participants: ConversationParticipant[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

export interface ConversationParticipant {
    userId: string;
    role: 'admin' | 'moderator' | 'member';
    joinedAt: string;
}

export interface Call {
    id: string;
    callerId: string;
    receiverId: string;
    type: 'audio' | 'video';
    status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'missed';
    startTime?: string;
    endTime?: string;
    duration?: number;
    createdAt: string;
}

export interface Friendship {
    id: string;
    userId: string;
    friendId: string;
    status: 'pending' | 'accepted' | 'rejected' | 'blocked';
    createdAt: string;
    updatedAt: string;
}

export interface SearchHistory {
    id: string;
    userId: string;
    query: string;
    type: 'user' | 'group' | 'message';
    createdAt: string;
} 