import { io, Socket } from "socket.io-client";
import { receiveIncomingCall } from "../features/calls/callsSlice";
import { receiveMessage } from "../features/chat/chatSlice";

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
    this.socket = io(
      `${process.env.REACT_APP_SOCKET_URL || "http://localhost:3000"}/chat`,
      {
        auth: {
          token: `Bearer ${token}`,
        },
        query: { userId },
      },
    );

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
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

    // Chat events
    this.socket.on("new_message", (message) => {
      this.dispatch?.(receiveMessage(message));
    });

    this.socket.on("message_delivered", (data) => {
      // Handle message delivered
      console.log("Message delivered:", data);
    });

    this.socket.on("message_read", (data) => {
      // Handle message read
      console.log("Message read:", data);
    });

    this.socket.on("typing_start", (data) => {
      // Handle typing start
      console.log("User typing:", data);
    });

    this.socket.on("typing_stop", (data) => {
      // Handle typing stop
      console.log("User stopped typing:", data);
    });

    this.socket.on("user_joined", (data) => {
      // Handle user joined room
      console.log("User joined room:", data);
    });

    this.socket.on("user_left", (data) => {
      // Handle user left room
      console.log("User left room:", data);
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
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
    this.socket?.emit("send_message", message);
  }

  joinConversation(conversationId: string) {
    this.socket?.emit("join_conversation", conversationId);
  }

  leaveConversation(conversationId: string) {
    this.socket?.emit("leave_conversation", conversationId);
  }

  startTyping(roomId: string) {
    this.socket?.emit("typing_start", { roomId });
  }

  stopTyping(roomId: string) {
    this.socket?.emit("typing_stop", { roomId });
  }

  markAsRead(roomId: string, messageIds: string[]) {
    this.socket?.emit("mark_as_read", { roomId, messageIds });
  }

  // Call methods
  startCall(receiverId: string, type: "audio" | "video") {
    this.socket?.emit("start_call", { receiverId, type });
  }

  answerCall(callerId: string) {
    this.socket?.emit("answer_call", { callerId });
  }

  rejectCall(callerId: string) {
    this.socket?.emit("reject_call", { callerId });
  }

  endCall(participantId: string) {
    this.socket?.emit("end_call", { participantId });
  }
}

export const socketService = new SocketService();
