import { PayloadAction } from '@reduxjs/toolkit';
import { delay, put, takeLatest } from 'redux-saga/effects';
import {
    fetchConversationsFailure,
    fetchConversationsRequest,
    fetchConversationsSuccess,
    fetchMessagesFailure,
    fetchMessagesRequest,
    fetchMessagesSuccess,
    sendMessageFailure,
    sendMessageRequest,
    sendMessageSuccess,
} from './chatSlice';
import { Conversation, Message } from './types';

// Mock data
const mockMessages: Message[] = [
    {
        id: '1',
        conversationId: '1',
        sender: {
            id: '1',
            username: 'John Doe',
            email: 'john@example.com',
            avatar: 'https://i.pravatar.cc/150?img=1'
        },
        content: 'Xin chào!',
        createdAt: new Date(),
        status: 'read'
    },
    {
        id: '2',
        conversationId: '1',
        sender: {
            id: '2',
            username: 'Jane Doe',
            email: 'jane@example.com',
            avatar: 'https://i.pravatar.cc/150?img=2'
        },
        content: 'Chào bạn!',
        createdAt: new Date(),
        status: 'read'
    }
];

const mockConversations: Conversation[] = [
    {
        id: '1',
        participants: [
            {
                id: '1',
                username: 'John Doe',
                email: 'john@example.com',
                avatar: 'https://i.pravatar.cc/150?img=1'
            },
            {
                id: '2',
                username: 'Jane Doe',
                email: 'jane@example.com',
                avatar: 'https://i.pravatar.cc/150?img=2'
            }
        ],
        lastMessage: mockMessages[1],
        unreadCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

function* handleFetchConversations() {
    try {
        yield delay(1000);
        yield put(fetchConversationsSuccess(mockConversations));
    } catch (error) {
        yield put(fetchConversationsFailure(error instanceof Error ? error.message : 'Failed to fetch conversations'));
    }
}

function* handleFetchMessages(action: PayloadAction<string>) {
    try {
        yield delay(1000);
        const messages = mockMessages.filter(msg => msg.conversationId === action.payload);
        yield put(fetchMessagesSuccess({
            conversationId: action.payload,
            messages
        }));
    } catch (error) {
        yield put(fetchMessagesFailure(error instanceof Error ? error.message : 'Failed to fetch messages'));
    }
}

function* handleSendMessage(action: PayloadAction<{ conversationId: string; content: string }>) {
    try {
        yield delay(500);
        const newMessage: Message = {
            id: Date.now().toString(),
            conversationId: action.payload.conversationId,
            sender: {
                id: '1',
                username: 'John Doe',
                email: 'john@example.com',
                avatar: 'https://i.pravatar.cc/150?img=1'
            },
            content: action.payload.content,
            createdAt: new Date(),
            status: 'sent'
        };
        yield put(sendMessageSuccess(newMessage));
    } catch (error) {
        yield put(sendMessageFailure(error instanceof Error ? error.message : 'Failed to send message'));
    }
}

export function* chatSaga() {
    yield takeLatest(fetchConversationsRequest.type, handleFetchConversations);
    yield takeLatest(fetchMessagesRequest.type, handleFetchMessages);
    yield takeLatest(sendMessageRequest.type, handleSendMessage);
} 