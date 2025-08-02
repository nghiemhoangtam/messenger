import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaginationRequest } from "../../types/pagination-request";
import { PaginationResponse } from "../../types/pagination-response";
import { Contact } from "../contacts/types";
import { Conversation, CreateGroupRoomRequest, Message } from "./types";

interface ChatState {
  roomPage: {
    data: PaginationResponse<Conversation>;
    loading: boolean;
    error: string | null;
  };
  currentConversation: Conversation | null;
  messagesLoading: boolean;
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
      action: PayloadAction<{ conversationId: string; content: string }>,
    ) => {
      state.roomPage.loading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action: PayloadAction<Message>) => {
      state.roomPage.loading = false;
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        if (conversation.room.id === action.payload.room_id) {
          return {
            ...conversation,
            room: {
              ...conversation.room,
              messagePage: {
                ...conversation.room.messagePage,
                results: [...conversation.room.messagePage.results, action.payload]
              }
            }
          };
        }
        return conversation;
      });
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.roomPage.loading = false;
      state.error = action.payload;
    },
    receiveMessage: (state, action: PayloadAction<Message>) => {
      const conversationId = action.payload.room_id;
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        if (conversation.room.id === conversationId) {
          return {
            ...conversation,
            lastMessage: action.payload,
            unread_count: conversationId !== state.currentConversation?.room.id 
              ? (conversation.unread_count || 0) + 1 
              : conversation.unread_count || 0,
            room: {
              ...conversation.room,
              messagePage: {
                ...conversation.room.messagePage,
                results: [...conversation.room.messagePage.results, action.payload]
              }
            }
          };
        }
        return conversation;
      });
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
} = chatSlice.actions;

export default chatSlice.reducer;
