import { Button, message, Popconfirm } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../../components/atoms/Loading/Loading";
import { startCallRequest } from "../../../../features/calls/callsSlice";
import { roomService } from "../../../../services/roomService";
import { socketService } from "../../../../services/socketService";
import { RootState } from "../../../../store";
import { PaginationRequest } from "../../../../types/pagination-request";
import { User } from "../../../auth";
import {
  fetchMessagesRequest,
  markMessagesAsReadRequest,
  sendMessageRequest
} from "../../chatSlice";
import { CallControls } from "../CallControls";
import { CallModal } from "../CallModal";
import { ChatInput } from "../ChatInput";
import { MessageBubble } from "../MessageBubble";
import styles from "./ChatWindow.module.css";

// Date separator component
const DateSeparator: React.FC<{ date: Date }> = ({ date }) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  let displayText = '';
  if (isToday) {
    displayText = 'Hôm nay';
  } else if (isYesterday) {
    displayText = 'Hôm qua';
  } else {
    displayText = date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  return (
    <div style={{ 
      textAlign: 'center', 
      margin: '16px 0',
      position: 'relative'
    }}>
      <div style={{
        backgroundColor: '#f0f0f0',
        color: '#666',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        display: 'inline-block',
        fontWeight: 500
      }}>
        {displayText}
      </div>
    </div>
  );
};

export const ChatWindow: React.FC = () => {
  const dispatch = useDispatch();
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const { currentConversation, roomPage, messagesLoading } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const previousConversationId = useRef<string | null>(null);

  useEffect(() => {
    if (currentConversation) {
      setLoadingMessages(true);
      dispatch(fetchMessagesRequest({ roomId: currentConversation.room.id, pageRequest: new PaginationRequest({ page: 1, limit: 15 }) }));
      dispatch(markMessagesAsReadRequest(currentConversation.room.id));
      
      // Join new conversation
      socketService.joinConversation(currentConversation.room.id);
      
      // Leave previous conversation if different
      if (previousConversationId.current && previousConversationId.current !== currentConversation.room.id) {
        socketService.leaveConversation(previousConversationId.current);
      }
      
      previousConversationId.current = currentConversation.room.id;
    }
  }, [currentConversation, dispatch]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (previousConversationId.current) {
        socketService.leaveConversation(previousConversationId.current);
      }
    };
  }, []);

  // Sync local loading state with Redux loading state
  useEffect(() => {
    setLoadingMessages(messagesLoading);
    // Reset loadingMoreMessages when messages finish loading
    if (!messagesLoading && loadingMoreMessages) {
      setLoadingMoreMessages(false);
    }
  }, [messagesLoading, loadingMoreMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [roomPage]);

  // Handle scroll to load more messages
  const handleMessageListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (!currentConversation) return;
    
    const currentConversationData = roomPage.data.results.find(
      (c) => c.room.id === currentConversation.room.id
    );
    
    if (
      target.scrollTop === 0 && // Scroll to top
      !loadingMoreMessages && // Not already loading
      currentConversationData && // Has conversation data
      currentConversationData.room.messagePage.meta.page < currentConversationData.room.messagePage.meta.totalPages // Has more pages
    ) {
      setLoadingMoreMessages(true);
      const nextPage = currentConversationData.room.messagePage.meta.page + 1;
      dispatch(
        fetchMessagesRequest({ 
          roomId: currentConversation.room.id, 
          pageRequest: new PaginationRequest({ page: nextPage, limit: 15 }) 
        })
      );
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;

    setSending(true);
    try {
      await dispatch(
        sendMessageRequest({
          conversationId: currentConversation.room.id,
          content,
          type: "text", // Thêm type cho text message
        })
      );
    } finally {
      setSending(false);
    }
  };

  const handleSendFile = async (
    file: File,
    type: "image" | "file" | "audio"
  ) => {
    if (!currentConversation) return;

    setSending(true);
    try {
      await dispatch(
        sendMessageRequest({
          conversationId: currentConversation.room.id,
          content: URL.createObjectURL(file),
          type, // Truyền type từ file
        })
      );
    } finally {
      setSending(false);
    }
  };

  const handleAudioCall = () => {
    if (!currentConversation) return;
    setCallType("audio");
    setIsCallModalVisible(true);
    dispatch(
      startCallRequest({
        participant:
          currentConversation.room.memberPage.results.find((p) => p.id !== user?.id) ||
          currentConversation.room.memberPage.results[0],
        type: "audio",
      })
    );
  };

  const handleVideoCall = () => {
    if (!currentConversation) return;
    setCallType("video");
    setIsCallModalVisible(true);
    dispatch(
      startCallRequest({
        participant:
          currentConversation.room.memberPage.results.find((p) => p.id !== user?.id) ||
          currentConversation.room.memberPage.results[0],
        type: "video",
      })
    );
  };

  const handleAnswerCall = () => {
    setIsCallModalVisible(false);
  };

  const handleRejectCall = () => {
    setIsCallModalVisible(false);
  };

  const handleEndCall = () => {
    setIsCallModalVisible(false);
  };

  const handleLeaveRoom = async () => {
    if (!currentConversation) return;
    try {
      await roomService.leaveRoom(currentConversation.room.id);
      message.success("Đã rời khỏi phòng");
      // Reload lại danh sách conversation
      dispatch({ type: "chat/fetchConversationsRequest" });
    } catch (err) {
      message.error("Rời phòng thất bại");
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    
    messages.forEach(message => {
      const messageDate = new Date(message.created_at);
      const dateKey = messageDate.toDateString();
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(message);
    });
    
    // Sort messages within each date group (oldest to newest)
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });
    
    return grouped;
  };

  if (!currentConversation) {
    return (
      <div className={styles.emptyState}>
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const currentMessages = roomPage.data.results
    .find((c) => c.room.id === currentConversation.room.id)
    ?.room.messagePage.results || [];

  const groupedMessages = groupMessagesByDate(currentMessages);
  const currentConversationData = roomPage.data.results.find(
    (c) => c.room.id === currentConversation.room.id
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{currentConversation.room.name}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <CallControls
            onAudioCall={handleAudioCall}
            onVideoCall={handleVideoCall}
            disabled={!currentConversation}
          />
          <Popconfirm
            title="Bạn chắc chắn muốn rời phòng này?"
            onConfirm={handleLeaveRoom}
            okText="Rời phòng"
            cancelText="Hủy"
          >
            <Button danger size="small">
              Rời phòng
            </Button>
          </Popconfirm>
        </div>
      </div>

      <div 
        className={styles.messageList}
        ref={messageListRef}
        onScroll={handleMessageListScroll}
      >
        {/* Show loading when loading more messages at top */}
        {loadingMoreMessages && (
          <div style={{ textAlign: 'center', padding: '10px' }}>
            <Loading local={true} />
          </div>
        )}

        {/* Show loading when messages are being loaded initially */}
        {loadingMessages && !loadingMoreMessages && (
          <Loading local={true} />
        )}
        
        {Object.entries(groupedMessages)
          .sort(([dateKeyA], [dateKeyB]) => 
            new Date(dateKeyA).getTime() - new Date(dateKeyB).getTime()
          )
          .map(([dateKey, messages]) => {
            const date = new Date(dateKey);
            return (
              <div key={dateKey}>
                <DateSeparator date={date} />
                {messages.map((msg) => {
            const sender = msg.sender;
            return (
              <MessageBubble
                key={msg.id}
                content={msg.content}
                type={
                  msg.content.startsWith("data:image")
                    ? "image"
                    : msg.content.startsWith("data:audio")
                      ? "audio"
                      : msg.content.startsWith("data:application")
                        ? "file"
                        : "text"
                }
                isOwn={msg.sender.id === user?.id}
                timestamp={new Date(msg.created_at).toLocaleTimeString()}
                status={msg.status}
                senderAvatar={sender?.avatar}
                senderName={sender?.display_name}
              />
                  );
                })}
              </div>
            );
          })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        loading={sending}
        roomId={currentConversation?.room.id}
      />

      <CallModal
        visible={isCallModalVisible}
        type={callType}
        caller={user as User}
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
        onEnd={handleEndCall}
        isIncoming={false}
      />
    </div>
  );
};
