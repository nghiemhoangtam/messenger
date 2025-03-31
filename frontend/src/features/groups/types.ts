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
