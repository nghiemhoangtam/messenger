import { CopyOutlined } from "@ant-design/icons";
import { Button, message, Popconfirm, Tooltip } from "antd";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../../components/atoms/Loading/Loading";
import { startCallRequest } from "../../../../features/calls/callsSlice";
import { mediaService } from "../../../../services/mediaService";
import { roomService } from "../../../../services/roomService";
import { socketService } from "../../../../services/socketService";
import { RootState } from "../../../../store";
import { createPaginationRequest } from "../../../../types/pagination-request";
import { User } from "../../../auth";
import {
    deleteMessageRequest,
    editMessageRequest,
    fetchMessagesRequest,
    markMessagesAsReadRequest,
    removeConversation,
    sendMessageRequest
} from "../../chatSlice";
import { Message, ReplyMessage } from "../../types";
import { CallControls } from "../CallControls";
import { CallModal } from "../CallModal";
import { ChatInput } from "../ChatInput";
import { MessageList } from "../MessageList";
import { TypingIndicator } from "../TypingIndicator";
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
  const [replyToMessage, setReplyToMessage] = useState<ReplyMessage | null>(null);
  const { currentConversation, roomPage, messagesLoading } = useSelector(
    (state: RootState) => state.chat
  );
  
  // Create a more specific selector for current conversation messages
  const currentConversationMessages = useSelector((state: RootState) => {
    const currentConv = state.chat.currentConversation;
    if (!currentConv) return [];
    
    const conversation = state.chat.roomPage.data.results.find(
      (c) => c.room.id === currentConv.room.id
    );
    
    return conversation?.room.messagePage.results || [];
  });
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const previousConversationId = useRef<string | null>(null);

  useEffect(() => {
    if (currentConversation) {
      setLoadingMessages(true);
      dispatch(fetchMessagesRequest({ roomId: currentConversation.room.id, pageRequest: createPaginationRequest({ page: 1, limit: 15 }) }));
      dispatch(markMessagesAsReadRequest(currentConversation.room.id));
      
      // Reset reply message when changing conversation
      setReplyToMessage(null);
      
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

  // Force re-render when messages change
  useEffect(() => {
    if (currentConversationMessages.length > 0) {
      // This will trigger a re-render when messages change
    }
  }, [currentConversationMessages]);

  // Handle scroll to load more messages
  const handleMessageListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
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
          pageRequest: createPaginationRequest({ page: nextPage, limit: 15 }) 
        })
      );
    }
  }, [currentConversation, roomPage.data.results, loadingMoreMessages, dispatch]);

  const handleSendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!currentConversation) return;

    setSending(true);
    try {
      await dispatch(
        sendMessageRequest({
          conversationId: currentConversation.room.id,
          content,
          type: "text", // Thêm type cho text message
          reply_to_id: replyToId,
        })
      );
      // Clear reply message after sending
      setReplyToMessage(null);
    } finally {
      setSending(false);
    }
  }, [currentConversation, dispatch]);

  const handleSendFile = useCallback(async (
    file: File,
    type: "image" | "file" | "audio",
    replyToId?: string
  ) => {
    if (!currentConversation) return;

    setSending(true);
    try {
      // Upload file first
      const uploadResult = await mediaService.uploadFile(file);
      
      // Send message with file_id
      await dispatch(
        sendMessageRequest({
          conversationId: currentConversation.room.id,
          content: file.name, // Use file name as content
          type,
          file_id: uploadResult.id,
          reply_to_id: replyToId,
        })
      );
      

      
      // Clear reply message after sending
      setReplyToMessage(null);
    } catch (error) {
      message.error("Gửi file thất bại");
    } finally {
      setSending(false);
    }
  }, [currentConversation, dispatch]);



  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!currentConversation) return;
    
    try {
      await dispatch(editMessageRequest({ messageId, content: newContent }));
    } catch (error) {
      message.error("Chỉnh sửa tin nhắn thất bại");
    }
  }, [currentConversation, dispatch]);

  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!currentConversation) return;

    try {
      await dispatch(deleteMessageRequest({ messageId }));
      message.success("Đã xóa tin nhắn");
    } catch (error) {
      message.error("Xóa tin nhắn thất bại");
    }
  }, [currentConversation, dispatch]);

  const handleReplyClick = useCallback((message: Message) => {
    setReplyToMessage({
      id: message.id,
      content: message.content,
      type: message.type || "text",
      sender: message.sender,
      created_at: message.created_at,
    });
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyToMessage(null);
  }, []);

  const handleScrollToMessage = useCallback((messageId: string) => {
    // Tìm message element trong DOM
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
    
    if (messageElement) {
      // Scroll đến message với animation
      messageElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Highlight message tạm thời
      messageElement.classList.add(styles.highlightMessage);
      setTimeout(() => {
        messageElement.classList.remove(styles.highlightMessage);
      }, 2000);
    }
  }, []);

  const handleAudioCall = useCallback(() => {
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
  }, [currentConversation, user?.id, dispatch]);

  const handleVideoCall = useCallback(() => {
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
  }, [currentConversation, user?.id, dispatch]);

  const handleAnswerCall = useCallback(() => {
    setIsCallModalVisible(false);
  }, []);

  const handleRejectCall = useCallback(() => {
    setIsCallModalVisible(false);
  }, []);

  const handleEndCall = useCallback(() => {
    setIsCallModalVisible(false);
  }, []);

  const handleLeaveRoom = useCallback(async () => {
    if (!currentConversation) return;
    try {
      await roomService.leaveRoom(currentConversation.room.id);
      message.success("Đã rời khỏi phòng");
      // Remove conversation from list immediately
      dispatch(removeConversation(currentConversation.room.id));
    } catch (err) {
      message.error("Rời phòng thất bại");
    }
  }, [currentConversation, dispatch]);

  const handleCopyRoomId = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentConversation) return;
    
    try {
      await navigator.clipboard.writeText(currentConversation.room.id);
      message.success("Đã copy Room ID");
    } catch (err) {
      message.error("Copy Room ID thất bại");
    }
  }, [currentConversation]);

  // Group messages by date
  const groupMessagesByDate = useMemo(() => {
    const grouped: { [key: string]: any[] } = {};
    
    currentConversationMessages.forEach(message => {
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
  }, [currentConversationMessages]);

  if (!currentConversation) {
    return (
      <div className={styles.emptyState}>
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{currentConversation.room.name}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {currentConversation.room.type === 'group' && (
            <Tooltip title="Copy Room ID">
              <Button
                type="text"
                size="small"
                icon={<CopyOutlined />}
                onClick={handleCopyRoomId}
                className={styles.copyButton}
              />
            </Tooltip>
          )}
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
        
        {Object.entries(groupMessagesByDate)
          .sort(([dateKeyA], [dateKeyB]) => 
            new Date(dateKeyA).getTime() - new Date(dateKeyB).getTime()
          )
          .map(([dateKey, messages]) => {
            const date = new Date(dateKey);
            return (
              <div key={dateKey}>
                <DateSeparator date={date} />
                <MessageList
                  messages={messages}
                  currentUserId={user?.id || ""}
                  onEditMessage={handleEditMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onReplyClick={handleReplyClick}
                  onScrollToMessage={handleScrollToMessage}
                />
              </div>
            );
          })}
        <div ref={messagesEndRef} />
        
        {/* Typing Indicator */}
        <TypingIndicator room_id={currentConversation.room.id} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        loading={sending}
        room_id={currentConversation?.room.id}
        replyToMessage={replyToMessage}
        onCancelReply={handleCancelReply}
        onScrollToMessage={handleScrollToMessage}
      />

      <CallModal
        open={isCallModalVisible}
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
