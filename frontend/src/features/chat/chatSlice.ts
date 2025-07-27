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
  messages: Record<string, Message[]>;
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
  error: string | null;
}

const initialState: ChatState = {
  roomPage: {
    data: new PaginationResponse<Conversation>(),
    loading: false,
    error: null,
  },
  currentConversation: null,
  newSearchGroupUser: {
    data: new PaginationResponse<Contact>(),
    loading: false,
    error: null,
  },
  messages: {},
  createGroupRoom: {
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
    },
    fetchMessagesRequest: (state, action: PayloadAction<string>) => {
      state.roomPage.loading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (
      state,
      action: PayloadAction<{ conversationId: string; messages: Message[] }>,
    ) => {
      state.roomPage.loading = false;
      state.messages[action.payload.conversationId] = action.payload.messages;
    },
    fetchMessagesFailure: (state, action: PayloadAction<string>) => {
      state.roomPage.loading = false;
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
      const conversationId = action.payload.room_id;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.roomPage.loading = false;
      state.error = action.payload;
    },
    receiveMessage: (state, action: PayloadAction<Message>) => {
      const conversationId = action.payload.room_id;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);

      // Update conversation last message and unread count
      const conversation = state.roomPage.data.results.find(
        (c) => c.room.id === conversationId,
      );
      if (conversation) {
        conversation.lastMessage = action.payload;
        if (conversationId !== state.currentConversation?.room.id) {
          conversation.unread_count += 1;
        }
      }
    },
    markMessagesAsRead: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      const conversation = state.roomPage.data.results.find(
        (c) => c.room.id === conversationId,
      );
      if (conversation) {
        conversation.unread_count = 0;
      }

      const messages = state.messages[conversationId];
      if (messages) {
        messages.forEach((message) => {
          if (message.status !== "read") {
            message.status = "read";
          }
        });
      }
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
  searchGroupUserRequest,
  searchGroupUserSuccess,
  searchGroupUserFailure,
  resetSearchGroupUser,
  createGroupRoomRequest,
  createGroupRoomSuccess,
  createGroupRoomFailure,
  resetCreateGroupRoom,
} = chatSlice.actions;

export default chatSlice.reducer;
