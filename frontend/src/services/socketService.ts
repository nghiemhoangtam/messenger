import { io, Socket } from 'socket.io-client';
import { receiveIncomingCall } from '../features/calls/callsSlice';
import { store } from '../store';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string) {
        this.socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3000', {
            query: { userId },
        });

        this.socket.on('connect', () => {
            console.log('Connected to socket server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
        });

        this.socket.on('incoming_call', (call) => {
            store.dispatch(receiveIncomingCall(call));
        });

        this.socket.on('call_accepted', (call) => {
            // Handle call accepted
        });

        this.socket.on('call_rejected', (call) => {
            // Handle call rejected
        });

        this.socket.on('call_ended', (call) => {
            // Handle call ended
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    // Chat methods
    sendMessage(message: any) {
        this.socket?.emit('send_message', message);
    }

    joinConversation(conversationId: string) {
        this.socket?.emit('join_conversation', conversationId);
    }

    leaveConversation(conversationId: string) {
        this.socket?.emit('leave_conversation', conversationId);
    }

    // Call methods
    startCall(receiverId: string, type: 'audio' | 'video') {
        this.socket?.emit('start_call', { receiverId, type });
    }

    answerCall(callerId: string) {
        this.socket?.emit('answer_call', { callerId });
    }

    rejectCall(callerId: string) {
        this.socket?.emit('reject_call', { callerId });
    }

    endCall(participantId: string) {
        this.socket?.emit('end_call', { participantId });
    }
}

export const socketService = new SocketService(); 