import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message } from './types';

interface ChatState {
    conversations: Conversation[];
    currentConversation: Conversation | null;
    messages: Record<string, Message[]>;
    loading: boolean;
    error: string | null;
}

const initialState: ChatState = {
    conversations: [],
    currentConversation: null,
    messages: {},
    loading: false,
    error: null,
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        fetchConversationsRequest: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
            state.loading = false;
            state.conversations = action.payload;
        },
        fetchConversationsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
            state.currentConversation = action.payload;
        },
        fetchMessagesRequest: (state, action: PayloadAction<string>) => {
            state.loading = true;
            state.error = null;
        },
        fetchMessagesSuccess: (state, action: PayloadAction<{ conversationId: string; messages: Message[] }>) => {
            state.loading = false;
            state.messages[action.payload.conversationId] = action.payload.messages;
        },
        fetchMessagesFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        sendMessageRequest: (state, action: PayloadAction<{ conversationId: string; content: string }>) => {
            state.loading = true;
            state.error = null;
        },
        sendMessageSuccess: (state, action: PayloadAction<Message>) => {
            state.loading = false;
            const conversationId = action.payload.conversationId;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(action.payload);
        },
        sendMessageFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
        },
        receiveMessage: (state, action: PayloadAction<Message>) => {
            const conversationId = action.payload.conversationId;
            if (!state.messages[conversationId]) {
                state.messages[conversationId] = [];
            }
            state.messages[conversationId].push(action.payload);

            // Update conversation last message and unread count
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.lastMessage = action.payload;
                if (conversationId !== state.currentConversation?.id) {
                    conversation.unreadCount += 1;
                }
            }
        },
        markMessagesAsRead: (state, action: PayloadAction<string>) => {
            const conversationId = action.payload;
            const conversation = state.conversations.find(c => c.id === conversationId);
            if (conversation) {
                conversation.unreadCount = 0;
            }

            const messages = state.messages[conversationId];
            if (messages) {
                messages.forEach(message => {
                    if (message.status !== 'read') {
                        message.status = 'read';
                    }
                });
            }
        },
    },
});

export const {
    fetchConversationsRequest,
    fetchConversationsSuccess,
    fetchConversationsFailure,
    setCurrentConversation,
    fetchMessagesRequest,
    fetchMessagesSuccess,
    fetchMessagesFailure,
    sendMessageRequest,
    sendMessageSuccess,
    sendMessageFailure,
    receiveMessage,
    markMessagesAsRead,
} = chatSlice.actions;

export default chatSlice.reducer; 