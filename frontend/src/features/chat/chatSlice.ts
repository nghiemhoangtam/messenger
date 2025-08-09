import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { Contact } from "../contacts/types";
import { Conversation, CreateGroupRoomRequest, Message, MessageMention, MessageThread, TypingIndicator, UserPresence } from "./types";

interface ChatState {
  roomPage: {
    data: PaginationResponse<Conversation>;
    loading: boolean;
    error: string | null;
  };
  currentConversation: Conversation | null;
  messagesLoading: boolean;
  messageUpdateCounter: number; // Add this to force re-renders
  newSearchGroupUser: {
    data: PaginationResponse<Contact>;
    loading: boolean;
    error: string | null;
  };
  createGroupRoom: {
    data: null;
    loading: boolean;
    error: string | null;
  };
  availableFriends: {
    data: PaginationResponse<Contact>;
    loading: boolean;
    error: string | null;
  };
  createPrivateRoom: {
    data: null;
    loading: boolean;
    error: string | null;
  };
  markMessagesAsRead: {
    data: null;
    loading: boolean;
    error: string | null;
  };
  typingIndicators: TypingIndicator[];
  userPresence: UserPresence[];
  messageThreads: MessageThread[];
  messageMentions: MessageMention[];
  error: string | null;
}

const initialState: ChatState = {
  roomPage: {
    data: new PaginationResponse<Conversation>(),
    loading: false,
    error: null,
  },
  currentConversation: null,
  messagesLoading: false,
  messageUpdateCounter: 0,
  newSearchGroupUser: {
    data: new PaginationResponse<Contact>(),
    loading: false,
    error: null,
  },
  createGroupRoom: {
    data: null,
    loading: false,
    error: null,
  },
  availableFriends: {
    data: new PaginationResponse<Contact>(),
    loading: false,
    error: null,
  },
  createPrivateRoom: {
    data: null,
    loading: false,
    error: null,
  },
  markMessagesAsRead: {
    data: null,
    loading: false,
    error: null,
  },
  typingIndicators: [],
  userPresence: [],
  messageThreads: [],
  messageMentions: [],
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    fetchConversationsRequest: (state, action: PayloadAction<PaginationRequest>) => {
      state.roomPage.loading = true;
      state.error = null;
    },
    fetchConversationsSuccess: (
      state,
      action: PayloadAction<PaginationResponse<Conversation>>,
    ) => {
      state.roomPage.data.results = [...state.roomPage.data.results, ...action.payload.results];
      state.roomPage.data.meta = action.payload.meta;
      state.roomPage.loading = false;
    },
    fetchConversationsFailure: (state, action: PayloadAction<string>) => {
      state.roomPage.loading = false;
      state.error = action.payload;
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation>) => {
      state.currentConversation = action.payload;
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        if (conversation.room.id === action.payload.room.id) {
          return {
            ...conversation,
            room: {
              ...conversation.room,
              memberPage: new PaginationResponse<Contact>(),
              messagePage: new PaginationResponse<Message>()
            }
          };
        }
        return conversation;
      });
    },
    fetchMessagesRequest: (state, action: PayloadAction<{ roomId: string; pageRequest: PaginationRequest }>) => {
      state.messagesLoading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action: PayloadAction<{ roomId: string; messages: PaginationResponse<Message> }>) => {
      const conversationIndex = state.roomPage.data.results.findIndex(
        (c) => c.room.id === action.payload.roomId,
      );
      if (conversationIndex !== -1) { 
        const conversation = state.roomPage.data.results[conversationIndex];
        state.roomPage.data.results[conversationIndex] = {
          ...conversation,
          room: {
            ...conversation.room,
            messagePage: {
              ...conversation.room.messagePage,
              results: [...conversation.room.messagePage.results, ...action.payload.messages.results],
              meta: action.payload.messages.meta
            }
          }
        };
      }
      state.messagesLoading = false;
    },
    fetchMessagesFailure: (state, action: PayloadAction<string>) => {
      state.messagesLoading = false;
      state.error = action.payload;
    },
    resetCreateGroupRoom: (state) => {
      state.createGroupRoom.data = null;
      state.createGroupRoom.loading = false;
      state.createGroupRoom.error = null;
    },
    sendMessageRequest: (
      state,
      action: PayloadAction<{ conversationId: string; content: string; type?: string }>,
    ) => {
      state.roomPage.loading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action: PayloadAction<void>) => {
      state.roomPage.loading = false;
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.roomPage.loading = false;
      state.error = action.payload;
    },
    receiveMessage: (state, action: PayloadAction<Message>) => {
      const conversationId = action.payload.room_id;
      
      console.log('🔄 receiveMessage action triggered:', {
        messageId: action.payload.id,
        conversationId,
        content: action.payload.content
      });
      
      const conversationIndex = state.roomPage.data.results.findIndex(
        conversation => conversation.room.id === conversationId
      );
      
      console.log('📊 Found conversation at index:', conversationIndex);
      
      if (conversationIndex === -1) {
        console.warn('❌ Conversation not found for message:', conversationId);
        return;
      }
      
      const conversation = state.roomPage.data.results[conversationIndex];
      console.log('📋 Current messages count:', conversation.room.messagePage.results.length);
      
      // Kiểm tra xem message đã tồn tại chưa (tránh duplicate)
      const messageExists = conversation.room.messagePage.results.some(
        msg => msg.id === action.payload.id
      );
      
      console.log('🔍 Message already exists:', messageExists);
      
      if (!messageExists) {
        // Thêm message mới vào danh sách
        const updatedResults = [...conversation.room.messagePage.results, action.payload];

        // Cập nhật state với immutability đúng cách
        const updatedConversations = state.roomPage.data.results.map((conv, index) => {
          if (index === conversationIndex) {
            const updatedConversation = {
              ...conv,
              lastMessage: action.payload,
              unread_count: conversationId !== state.currentConversation?.room.id 
                ? (conv.unread_count || 0) + 1 
                : conv.unread_count || 0,
              room: {
                ...conv.room,
                messagePage: {
                  ...conv.room.messagePage,
                  results: updatedResults
                }
              }
            };
            
            console.log('✅ Updated conversation with new message. New message count:', updatedResults.length);
            return updatedConversation;
          }
          return conv;
        });

        // Cập nhật toàn bộ roomPage.data.results để đảm bảo React nhận biết được thay đổi
        state.roomPage.data.results = updatedConversations;
        state.messageUpdateCounter += 1; // Increment counter to force re-render

        console.log('🎉 Added new message:', action.payload.id);
      } else {
        console.log('⏭️ Message already exists, skipping:', action.payload.id);      
      }
    },
    markMessagesAsReadRequest: (state, action: PayloadAction<string>) => {
      state.markMessagesAsRead.loading = true;
      state.markMessagesAsRead.error = null;
    },
    markMessagesAsReadSuccess: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        if (conversation.room.id === conversationId) {
          return {
            ...conversation,
            unread_count: 0,
            room: {
              ...conversation.room,
              messagePage: {
                ...conversation.room.messagePage,
                results: conversation.room.messagePage.results.map(message => ({
                  ...message,
                  status: message.status !== "read" ? "read" : message.status
                }))
              }
            }
          };
        }
        return conversation;
      });
    },
    searchGroupUserRequest: (state, action: PayloadAction<PaginationRequest>) => {
      state.newSearchGroupUser.loading = true;
      state.newSearchGroupUser.error = null;
    },
    searchGroupUserSuccess: (state, action: PayloadAction<PaginationResponse<Contact>>) => {
      state.newSearchGroupUser.data.results = [...state.newSearchGroupUser.data.results, ...action.payload.results];
      state.newSearchGroupUser.data.meta = action.payload.meta;
      state.newSearchGroupUser.loading = false;
    },
    searchGroupUserFailure: (state, action: PayloadAction<string>) => {
      state.newSearchGroupUser.loading = false;
      state.newSearchGroupUser.error = action.payload;
    },
    resetSearchGroupUser: (state) => {
      state.newSearchGroupUser.data = new PaginationResponse<Contact>();
      state.newSearchGroupUser.loading = false;
      state.newSearchGroupUser.error = null;
    },
    createGroupRoomRequest: (state, action: PayloadAction<CreateGroupRoomRequest>) => {
      state.createGroupRoom.loading = true;
      state.createGroupRoom.error = null;
    },
    createGroupRoomSuccess: (state, action: PayloadAction<Conversation>) => {
      state.roomPage.data.results.push(action.payload);
      state.createGroupRoom.loading = false;
    },
    createGroupRoomFailure: (state, action: PayloadAction<string>) => {
      state.createGroupRoom.loading = false;
      state.createGroupRoom.error = action.payload;
    },
    getAvailableFriendsRequest: (state, action: PayloadAction<PaginationRequest>) => {
      state.availableFriends.loading = true;
      state.availableFriends.error = null;
    },
    getAvailableFriendsSuccess: (state, action: PayloadAction<PaginationResponse<Contact>>) => {
      state.availableFriends.data.results = [...state.availableFriends.data.results, ...action.payload.results];
      state.availableFriends.data.meta = action.payload.meta;
      state.availableFriends.loading = false;
    },
    getAvailableFriendsFailure: (state, action: PayloadAction<string>) => {
      state.availableFriends.loading = false;
      state.availableFriends.error = action.payload;
    },
    resetAvailableFriends: (state) => {
      state.availableFriends.data = new PaginationResponse<Contact>();
      state.availableFriends.loading = false;
      state.availableFriends.error = null;
    },
    createPrivateRoomRequest: (state, action: PayloadAction<string>) => {
      state.createPrivateRoom.loading = true;
      state.createPrivateRoom.error = null;
    },
    createPrivateRoomSuccess: (state, action: PayloadAction<Conversation>) => {
      state.roomPage.data.results.push(action.payload);            
      state.createPrivateRoom.loading = false;
    },
    removeAvailableFriend: (state, action: PayloadAction<string>) => {
      state.availableFriends.data.results = state.availableFriends.data.results.filter(friend => friend.id !== action.payload);
    },
    createPrivateRoomFailure: (state, action: PayloadAction<string>) => {
      state.createPrivateRoom.loading = false;
      state.createPrivateRoom.error = action.payload;
    },
    resetCreatePrivateRoom: (state) => {
      state.createPrivateRoom.data = null;
      state.createPrivateRoom.loading = false;
      state.createPrivateRoom.error = null;
    },
    markMessagesAsReadFailure: (state, action: PayloadAction<string>) => {
      state.markMessagesAsRead.loading = false;
      state.markMessagesAsRead.error = action.payload;
    },
    // New actions for enhanced features
    setTypingIndicator: (state, action: PayloadAction<TypingIndicator>) => {
      const existingIndex = state.typingIndicators.findIndex(
        ti => ti.room_id === action.payload.room_id && ti.user.id === action.payload.user.id
      );
      if (existingIndex >= 0) {
        state.typingIndicators[existingIndex] = action.payload;
      } else {
        state.typingIndicators.push(action.payload);
      }
    },
    removeTypingIndicator: (state, action: PayloadAction<{ room_id: string; user: Contact }>) => {
      state.typingIndicators = state.typingIndicators.filter(
        ti => !(ti.room_id === action.payload.room_id && ti.user.id === action.payload.user.id)
      );
    },
    setUserPresence: (state, action: PayloadAction<UserPresence>) => {
      const existingIndex = state.userPresence.findIndex(
        up => up.user_id === action.payload.user_id
      );
      if (existingIndex >= 0) {
        state.userPresence[existingIndex] = action.payload;
      } else {
        state.userPresence.push(action.payload);
      }
    },
    addMessageThread: (state, action: PayloadAction<MessageThread>) => {
      state.messageThreads.push(action.payload);
    },
    addMessageMention: (state, action: PayloadAction<MessageMention>) => {
      state.messageMentions.push(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: string; status: string }>) => {      
      // Update message status in current conversation
      const room = state.roomPage.data.results.find(item => state.currentConversation?.room.id === item.room.id)?.room;
      if (room) {
        const messageIndex = room.messagePage.results.findIndex(
          (m) => m.id === action.payload.messageId
        );
        if (messageIndex >= 0) {
          room.messagePage.results[
            messageIndex
          ].status = action.payload.status as any;
        }
      }
    },
    removeConversation: (state, action: PayloadAction<string>) => {
      // Remove conversation from list
      state.roomPage.data.results = state.roomPage.data.results.filter(
        conversation => conversation.room.id !== action.payload
      );
      // Clear current conversation if it's the one being removed
      if (state.currentConversation?.room.id === action.payload) {
        state.currentConversation = null;
      }
    }
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
  markMessagesAsReadRequest,
  markMessagesAsReadSuccess,
  searchGroupUserRequest,
  searchGroupUserSuccess,
  searchGroupUserFailure,
  resetSearchGroupUser,
  createGroupRoomRequest,
  createGroupRoomSuccess,
  createGroupRoomFailure,
  resetCreateGroupRoom,
  getAvailableFriendsRequest,
  getAvailableFriendsSuccess,
  getAvailableFriendsFailure,
  resetAvailableFriends,
  createPrivateRoomRequest,
  createPrivateRoomSuccess,
  createPrivateRoomFailure,
  resetCreatePrivateRoom,
  removeAvailableFriend,
  markMessagesAsReadFailure,
  setTypingIndicator,
  removeTypingIndicator,
  setUserPresence,
  addMessageThread,
  addMessageMention,
  updateMessageStatus,
  removeConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
