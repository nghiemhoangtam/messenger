import { io, Socket } from "socket.io-client";
import { receiveIncomingCall } from "../features/calls/callsSlice";
import {
  receiveMessage,
  removeTypingIndicator,
  setTypingIndicator,
  updateMessageStatus,
  updateRoomActivity,
  updateRoomOnlineUsers,
  updateUserActivity
} from "../features/chat/chatSlice";

export class SocketService {
  private socket: Socket | null = null;
  private keepAliveIntervals: Map<string, NodeJS.Timeout> = new Map();
  private dispatch: Function | null = null;

  initialize(dispatch: Function) {
    this.dispatch = dispatch;
  }

  isConnected(): boolean {
    const connected = this.socket?.connected || false;
    return connected;
  }



  connect(userId: string, token: string) {
    // Sử dụng port 8080 và namespace /chat như trong chat.gateway.ts
    this.socket = io(
      `${process.env.REACT_APP_SOCKET_URL || "http://localhost:8080"}/chat`,
      {
        transports: ['websocket'],
        forceNew: true,
        auth: {
          token: `Bearer ${token}`,
        },
        query: { userId },
      },
    );

    this.socket.on("connect", () => {
    });

    this.socket.on("disconnect", (reason) => {
    });

    // Call events
    this.socket.on("incoming_call", (call) => {
      this.dispatch?.(receiveIncomingCall(call));
    });

    this.socket.on("call_accepted", (call) => {
      // Handle call accepted
    });

    this.socket.on("call_rejected", (call) => {
      // Handle call rejected
    });

    this.socket.on("call_ended", (call) => {
      // Handle call ended
    });

    // Message events
    this.socket.on("new_message", (message) => {
      this.dispatch?.(receiveMessage(message));
    });

    this.socket.on("message_delivered", (data) => {
      this.dispatch?.(updateMessageStatus({ 
        messageId: data.message_id, 
        status: "delivered" 
      }));
    });

    this.socket.on("message_read", (data) => {
      this.dispatch?.(updateMessageStatus({ 
        messageId: data.message_id, 
        status: "read" 
      }));
    });

    // Typing events
    this.socket.on("typing_start", (data) => {
      // Create typing indicator with user data
      const typingIndicator = {
        id: `${data.user.id}_${data.room_id}`,
        room_id: data.room_id,
        user: data.user,
        started_at: data.timestamp, // Store as ISO string or timestamp
        expires_at: Date.now() + 5000 // Store as timestamp
      };
      this.dispatch?.(setTypingIndicator(typingIndicator));
    });

    this.socket.on("typing_stop", (data) => {
      this.dispatch?.(removeTypingIndicator({ 
        room_id: data.room_id, 
        user: data.user 
      }));
    });

    this.socket.on("user_joined", (data) => {
      if (this.dispatch) {
        // Dispatch action để update room activity
        this.dispatch(updateUserActivity({
          user_id: data.user_id,
          room_id: data.room_id,
          status: 'online',
          timestamp: data.timestamp,
          online_count: data.online_count,
          total_members: data.total_members,
          away_count: data.away_count,
          busy_count: data.busy_count,
        }));
      }
    });

    this.socket.on("user_left", (data) => {
      if (this.dispatch) {
        // Dispatch action để update room activity
        this.dispatch(updateUserActivity({
          user_id: data.user_id,
          room_id: data.room_id,
          status: 'offline',
          timestamp: data.timestamp,
          online_count: data.online_count,
          total_members: data.total_members,
          away_count: data.away_count,
          busy_count: data.busy_count,
        }));
      }
    });

    this.socket.on("user_activity_changed", (data) => {
      if (this.dispatch) {
        // Dispatch action để update room activity
        this.dispatch(updateUserActivity({
          user_id: data.user_id,
          room_id: data.room_id,
          status: data.status,
          timestamp: data.timestamp,
          online_count: data.online_count,
          total_members: data.total_members,
          away_count: data.away_count,
          busy_count: data.busy_count,
        }));
      }
    });

    // Room activity events - QUAN TRỌNG: Lắng nghe event room_activity để cập nhật real-time
    this.socket.on("room_activity", (data) => {
      if (this.dispatch) {
        // Dispatch action để update room activity
        this.dispatch(updateRoomActivity({
          room_id: data.room_id,
          online_count: data.online_count,
          total_members: data.total_members,
          away_count: data.away_count,
          busy_count: data.busy_count,
          offline_count: data.offline_count,
        }));
      }
    });

    // Room online users events
    this.socket.on("room_online_users", (data) => {
      if (this.dispatch) {
        // Dispatch action để update room online users
        this.dispatch(updateRoomOnlineUsers({
          room_id: data.room_id,
          users: data.users,
        }));
      }
    });

    // Keep alive events
    this.socket.on("keep_alive_ack", (data) => {
      // Có thể thêm logic xử lý keep alive nếu cần
    });
  }

  disconnect() {
    if (this.socket) {
      // Disconnect from socket server
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat methods - tương thích với chat.gateway.ts
  sendMessage(message: { room_id: string; content: string; type?: string }) {
    if (this.socket?.connected) {
      this.socket.emit("send_message", message);
    }
  }

  joinConversation(room_id: string) {
    if (this.socket?.connected) {
      this.socket.emit("join_conversation", room_id);
    }
  }

  leaveConversation(room_id: string) {
    if (this.socket?.connected) {
      this.socket.emit("leave_conversation", room_id);
    }
  }

  // Typing methods
  startTyping(room_id: string) {
    if (this.socket?.connected) {
      this.socket.emit("typing_start", { room_id });
    }
  }

  stopTyping(room_id: string) {
    if (this.socket?.connected) {
      // Stop typing in room
      this.socket.emit("typing_stop", { room_id });
    }
  }

  // Message read methods
  markMessagesAsRead(message_ids: string[]) { 
    if (this.socket?.connected) {
      // Mark messages as read
      this.socket.emit("mark_messages_read", { message_ids });
    }
  }

  // Activity methods
  updateActivityStatus(room_id: string, status: 'online' | 'offline' | 'away' | 'busy') {
    if (this.socket?.connected) {
      // Update activity status
      this.socket.emit("update_activity_status", { room_id, status });
    }
  }

  getRoomActivity(room_id: string) {
    if (this.socket?.connected) {
      // Get room activity for room
      this.socket.emit("get_room_activity", room_id);
    }
  }

  // Keep alive methods
  startKeepAlive(room_id: string, interval: number = 30000) {
    // Clear existing interval if any
    this.stopKeepAlive(room_id);

    // Start new keep alive interval
    const keepAliveInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("keep_alive", { room_id });
      }
    }, interval);

    this.keepAliveIntervals.set(room_id, keepAliveInterval);
  }

  stopKeepAlive(room_id: string) {
    const interval = this.keepAliveIntervals.get(room_id);
    if (interval) {
      clearInterval(interval);
      this.keepAliveIntervals.delete(room_id);
    }
  }

  // Call methods
  startCall(receiverId: string, type: "audio" | "video") {
    if (this.socket?.connected) {
      this.socket.emit("start_call", { receiverId, type });
    }
  }

  answerCall(callerId: string) {
      if (this.socket?.connected) {
      this.socket.emit("answer_call", { callerId });
    }
  }

  rejectCall(callerId: string) {
    if (this.socket?.connected) {
      this.socket.emit("reject_call", { callerId });
    }
  }

  endCall(participantId: string) {
    if (this.socket?.connected) {
      this.socket.emit("end_call", { participantId });
    }
  }

  // Utility methods
  getSocketId(): string | undefined {
    const socketId = this.socket?.id;
    return socketId;
  }

  isSocketConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance for external listeners
  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
