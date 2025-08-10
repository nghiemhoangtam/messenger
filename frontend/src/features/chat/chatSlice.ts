import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PaginationRequest } from "../../types/pagination-request";
import { createPaginationResponse, PaginationResponse } from "../../types/pagination-response";
import { Contact } from "../contacts/types";
import { Conversation, CreateGroupRoomRequest, Message, MessageMention, MessageThread, RoomActivityState, RoomOnlineUsers, TypingIndicator, UserPresence } from "./types";

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
  roomActivity: { [roomId: string]: RoomActivityState };
  roomOnlineUsers: RoomOnlineUsers;
  error: string | null;
}

const initialState: ChatState = {
  roomPage: {
    data: createPaginationResponse<Conversation>(),
    loading: false,
    error: null,
  },
  currentConversation: null,
  messagesLoading: false,
  messageUpdateCounter: 0,
  newSearchGroupUser: {
    data: createPaginationResponse<Contact>(),
    loading: false,
    error: null,
  },
  createGroupRoom: {
    data: null,
    loading: false,
    error: null,
  },
  availableFriends: {
    data: createPaginationResponse<Contact>(),
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
  roomActivity: {},
  roomOnlineUsers: {},
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
      // Ensure roomPage.data exists
      if (!state.roomPage.data) {
        state.roomPage.data = createPaginationResponse<Conversation>();
      }
      
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
      
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        if (conversation.room.id === action.payload.room.id) {
          return {
            ...conversation,
            room: {
              ...conversation.room,
                      memberPage: createPaginationResponse<Contact>(),
        messagePage: createPaginationResponse<Message>()
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
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
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
      
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
      const conversationIndex = state.roomPage.data.results.findIndex(
        conversation => conversation.room.id === conversationId
      );
      

      
      if (conversationIndex === -1) {

        return;
      }
      
      const conversation = state.roomPage.data.results[conversationIndex];

      
      // Kiểm tra xem message đã tồn tại chưa (tránh duplicate)
      const messageExists = conversation.room.messagePage.results.some(
        msg => msg.id === action.payload.id
      );
      

      
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
            

            return updatedConversation;
          }
          return conv;
        });

        // Cập nhật toàn bộ roomPage.data.results để đảm bảo React nhận biết được thay đổi
        state.roomPage.data.results = updatedConversations;
        // state.messageUpdateCounter += 1; // Increment counter to force re-render


      } else {      
      }
    },
    markMessagesAsReadRequest: (state, action: PayloadAction<string>) => {
      state.markMessagesAsRead.loading = true;
      state.markMessagesAsRead.error = null;
    },
    markMessagesAsReadSuccess: (state, action: PayloadAction<string>) => {
      const conversationId = action.payload;
      
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
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
      state.newSearchGroupUser.data = createPaginationResponse<Contact>();
      state.newSearchGroupUser.loading = false;
      state.newSearchGroupUser.error = null;
    },
    createGroupRoomRequest: (state, action: PayloadAction<CreateGroupRoomRequest>) => {
      state.createGroupRoom.loading = true;
      state.createGroupRoom.error = null;
    },
    createGroupRoomSuccess: (state, action: PayloadAction<Conversation>) => {
      // Ensure roomPage.data exists
      if (!state.roomPage.data) {
        state.roomPage.data = createPaginationResponse<Conversation>();
      }
      
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
      state.availableFriends.data = createPaginationResponse<Contact>();
      state.availableFriends.loading = false;
      state.availableFriends.error = null;
    },
    createPrivateRoomRequest: (state, action: PayloadAction<string>) => {
      state.createPrivateRoom.loading = true;
      state.createPrivateRoom.error = null;
    },
    createPrivateRoomSuccess: (state, action: PayloadAction<Conversation>) => {
      // Ensure roomPage.data exists
      if (!state.roomPage.data) {
        state.roomPage.data = createPaginationResponse<Conversation>();
      }
      
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
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
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
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
      // Remove conversation from list
      state.roomPage.data.results = state.roomPage.data.results.filter(
        conversation => conversation.room.id !== action.payload
      );
      // Clear current conversation if it's the one being removed
      if (state.currentConversation?.room.id === action.payload) {
        state.currentConversation = null;
      }
    },
    updateRoomActivity: (state, action: PayloadAction<{ 
      room_id: string; 
      online_count: number; 
      total_members: number;
      away_count: number;
      busy_count: number;
      offline_count: number;
    }>) => {
      const { room_id, online_count, total_members, away_count, busy_count, offline_count } = action.payload;
      
      // Check if the data has actually changed to prevent unnecessary updates
      const existingActivity = state.roomActivity[room_id];
      if (existingActivity) {
        const hasChanged = 
          existingActivity.online_count !== online_count ||
          existingActivity.total_members !== total_members ||
          existingActivity.away_count !== away_count ||
          existingActivity.busy_count !== busy_count ||
          existingActivity.offline_count !== offline_count;
        
        // Only update if there are actual changes
        if (!hasChanged) {
          return;
        }
      }
      
      // Calculate if room is active based on multiple criteria
      const hasOnlineUsers = online_count > 0 || away_count > 0 || busy_count > 0;
      const isActive = hasOnlineUsers;
      
      // Determine activity level
      let activityLevel: 'high' | 'medium' | 'low' | 'inactive' = 'inactive';
      if (online_count >= 3) {
        activityLevel = 'high';
      } else if (online_count >= 1 || away_count >= 1 || busy_count >= 1) {
        activityLevel = 'low';
      } else if (isActive) {
        activityLevel = 'low';
      }
      
      state.roomActivity[room_id] = {
        room_id,
        online_count,
        total_members,
        away_count,
        busy_count,
        offline_count,
        is_active: isActive,
        activity_level: activityLevel,
      };
    },

    updateRoomOnlineUsers: (state, action: PayloadAction<{ 
      room_id: string; 
      users: string[] 
    }>) => {
      if (!state.roomOnlineUsers[action.payload.room_id]) {
        state.roomOnlineUsers[action.payload.room_id] = [];
      }
      state.roomOnlineUsers[action.payload.room_id] = action.payload.users;
    },

    updateUserActivity: (state, action: PayloadAction<{ 
      user_id: string; 
      room_id: string; 
      status: string; 
      timestamp: Date; 
      online_count: number;
      total_members: number;
      away_count: number;
      busy_count: number;
    }>) => {
      const { room_id, online_count, total_members, away_count, busy_count } = action.payload;
      
      // Update room activity if it exists
      if (state.roomActivity[room_id]) {
        // Check if the data has actually changed to prevent unnecessary updates
        const existingActivity = state.roomActivity[room_id];
        const newOfflineCount = total_members - online_count - away_count - busy_count;
        
        const hasChanged = 
          existingActivity.online_count !== online_count ||
          existingActivity.total_members !== total_members ||
          existingActivity.away_count !== away_count ||
          existingActivity.busy_count !== busy_count ||
          existingActivity.offline_count !== newOfflineCount;
        
        // Only update if there are actual changes
        if (!hasChanged) {
          return;
        }
        
        state.roomActivity[room_id].online_count = online_count;
        state.roomActivity[room_id].total_members = total_members;
        state.roomActivity[room_id].away_count = away_count;
        state.roomActivity[room_id].busy_count = busy_count;
        state.roomActivity[room_id].offline_count = newOfflineCount;
      }
    },
    editMessageRequest: (state, action: PayloadAction<{ messageId: string; content: string }>) => {
      // No loading state needed for edit as it's optimistic
    },
    editMessageSuccess: (state, action: PayloadAction<Message>) => {
      const updatedMessage = action.payload;
      
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
      // Update message in all conversations
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        // Check if messagePage.results exists
        if (!conversation.room.messagePage.results) {
          return conversation;
        }
        
        if (conversation.room.id === updatedMessage.room_id) {
          // Update messages in the conversation
          const updatedMessages = conversation.room.messagePage.results.map(message => 
            message.id === updatedMessage.id ? updatedMessage : message
          );
          
          // Find the most recent message to determine the lastMessage
          const mostRecentMessage = updatedMessages.length > 0 
            ? updatedMessages.reduce((latest, current) => {
                return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
              })
            : undefined;
          
          const updatedConversation = {
            ...conversation,
            // Update lastMessage to the most recent message or undefined if no messages
            lastMessage: mostRecentMessage,
            room: {
              ...conversation.room,
              messagePage: {
                ...conversation.room.messagePage,
                results: updatedMessages
              }
            }
          };
          
          return updatedConversation;
        }
        return conversation;
      });
      
      // state.messageUpdateCounter += 1; // Force re-render
    },
    editMessageFailure: (state, action: PayloadAction<{ messageId: string; error: string }>) => {
      // Could add error handling here if needed
    },
    deleteMessageRequest: (state, action: PayloadAction<{ messageId: string }>) => {
      // No loading state needed for delete as it's optimistic
    },
    deleteMessageSuccess: (state, action: PayloadAction<{ messageId: string }>) => {
      const { messageId } = action.payload;
      
      // Check if data and results exist before processing
      if (!state.roomPage.data || !state.roomPage.data.results) {
        return;
      }
      
      // Remove message from all conversations
      state.roomPage.data.results = state.roomPage.data.results.map(conversation => {
        // Check if messagePage.results exists
        console.log(!conversation.room.messagePage);
        if (!conversation.room.messagePage || !conversation.room.messagePage.results) {
          return conversation;
        }
        
        if (conversation.room.messagePage.results.some(message => message.id === messageId)) {
          // Remove the message from the conversation
          const updatedMessages = conversation.room.messagePage.results.filter(message => 
            message.id !== messageId
          );
          
          // Find the most recent message to determine the lastMessage
          const mostRecentMessage = updatedMessages.length > 0 
            ? updatedMessages.reduce((latest, current) => {
                return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
              })
            : undefined;
          
          const updatedConversation = {
            ...conversation,
            // Update lastMessage to the most recent message or undefined if no messages
            lastMessage: mostRecentMessage,
            room: {
              ...conversation.room,
              messagePage: {
                ...conversation.room.messagePage,
                results: updatedMessages,
                meta: {
                  ...conversation.room.messagePage.meta,
                  total: Math.max(0, conversation.room.messagePage.meta.total - 1)
                }
              }
            }
          };
          
          return updatedConversation;
        }
        return conversation;
      });
    },
    deleteMessageFailure: (state, action: PayloadAction<{ messageId: string; error: string }>) => {
      // Could add error handling here if needed
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
  setTypingIndicator,
  removeTypingIndicator,
  setUserPresence,
  addMessageThread,
  addMessageMention,
  updateMessageStatus,
  removeConversation,
  updateRoomActivity,
  updateRoomOnlineUsers,
  updateUserActivity,
  editMessageRequest,
  editMessageSuccess,
  editMessageFailure,
  deleteMessageRequest,
  deleteMessageSuccess,
  deleteMessageFailure,
} = chatSlice.actions;

export default chatSlice.reducer;
