import { io, Socket } from "socket.io-client";
import { receiveIncomingCall } from "../features/calls/callsSlice";
import { receiveMessage, removeTypingIndicator, setTypingIndicator, updateMessageStatus } from "../features/chat/chatSlice";

class SocketService {
  private socket: Socket | null = null;
  private dispatch: Function | null = null;

  initialize(dispatch: Function) {
    this.dispatch = dispatch;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connect(userId: string, token: string) {
    console.log("Connecting to socket server");
    
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
      console.log("✅ Connected to socket server");
      console.log("Socket ID:", this.socket?.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from socket server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
    });

    // Call events
    this.socket.on("incoming_call", (call) => {
      console.log("📞 Incoming call:", call);
      this.dispatch?.(receiveIncomingCall(call));
    });

    this.socket.on("call_accepted", (call) => {
      console.log("📞 Call accepted:", call);
      // Handle call accepted
    });

    this.socket.on("call_rejected", (call) => {
      console.log("📞 Call rejected:", call);
      // Handle call rejected
    });

    this.socket.on("call_ended", (call) => {
      console.log("📞 Call ended:", call);
      // Handle call ended
    });

    // Chat events - tương thích với chat.gateway.ts
    this.socket.on("new_message", (message) => {
      console.log('📨 Received new message via WebSocket:', message);
      this.dispatch?.(receiveMessage(message));
    });

    this.socket.on("message_delivered", (data) => {
      console.log("✅ Message delivered:", data);
      this.dispatch?.(updateMessageStatus({ 
        messageId: data.message_id, 
        status: "delivered" 
      }));
    });

    this.socket.on("message_read", (data) => {
      console.log("👁️ Message read:", data);
      this.dispatch?.(updateMessageStatus({ 
        messageId: data.message_id, 
        status: "read" 
      }));
    });

    this.socket.on("typing_start", (data) => {
      console.log("⌨️ User typing:", data);
      // Create typing indicator with user data
      const typingIndicator = {
        id: `${data.user.id}_${data.room_id}`,
        room_id: data.room_id,
        user: data.user,
        started_at: new Date(data.timestamp),
        expires_at: new Date(Date.now() + 5000) // 5 seconds expiry
      };
      this.dispatch?.(setTypingIndicator(typingIndicator));
    });

    this.socket.on("typing_stop", (data) => {
      console.log("⏹️ User stopped typing:", data);
      this.dispatch?.(removeTypingIndicator({ 
        room_id: data.room_id, 
        user: data.user 
      }));
    });

    this.socket.on("user_joined", (data) => {
      console.log("👋 User joined room:", data);
      // Có thể dispatch action để update room participants
    });

    this.socket.on("user_left", (data) => {
      console.log("👋 User left room:", data);
      // Có thể dispatch action để update room participants
    });

    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting from socket server");
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Chat methods - tương thích với chat.gateway.ts
  sendMessage(message: { room_id: string; content: string; type?: string }) {
    console.log('📤 Sending message via WebSocket:', message);
    this.socket?.emit("send_message", message);
  }

  joinConversation(room_id: string) {
    console.log('🚪 Joining conversation:', room_id);
    this.socket?.emit("join_conversation", room_id);
  }

  leaveConversation(room_id: string) {
    console.log('🚪 Leaving conversation:', room_id);
    this.socket?.emit("leave_conversation", room_id);
  }

  startTyping(room_id: string) {
    console.log('⌨️ Starting typing in room:', room_id);
    this.socket?.emit("typing_start", { room_id });
  }

  stopTyping(room_id: string) {
    console.log('⏹️ Stopping typing in room:', room_id);
    this.socket?.emit("typing_stop", { room_id });
  }

  markAsRead(room_id: string, message_ids: string[]) {
    console.log('👁️ Marking messages as read:', { room_id, message_ids });
    this.socket?.emit("mark_as_read", { room_id, message_ids });
  }

  // Call methods
  startCall(receiverId: string, type: "audio" | "video") {
    console.log('📞 Starting call:', { receiverId, type });
    this.socket?.emit("start_call", { receiverId, type });
  }

  answerCall(callerId: string) {
    console.log('📞 Answering call:', callerId);
    this.socket?.emit("answer_call", { callerId });
  }

  rejectCall(callerId: string) {
    console.log('📞 Rejecting call:', callerId);
    this.socket?.emit("reject_call", { callerId });
  }

  endCall(participantId: string) {
    console.log('📞 Ending call:', participantId);
    this.socket?.emit("end_call", { participantId });
  }

  // Utility methods
  getSocketId(): string | undefined {
    return this.socket?.id;
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
