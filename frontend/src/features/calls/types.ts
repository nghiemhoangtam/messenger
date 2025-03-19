import { User } from '../auth/types';

export interface Call {
    id: string;
    caller: User;
    receiver: User;
    status: 'ringing' | 'connected' | 'ended' | 'missed' | 'incoming' | 'outgoing';
    startTime?: Date;
    endTime?: Date;
    type: 'audio' | 'video';
    duration?: string;
}

export interface CallsState {
    calls: Call[];
    currentCall: Call | null;
    loading: boolean;
    error: string | null;
} 