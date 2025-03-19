import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { startCallRequest } from "../../../../features/calls/callsSlice";
import { RootState } from "../../../../store";
import {
  fetchMessagesRequest,
  markMessagesAsRead,
  sendMessageRequest,
} from "../../chatSlice";
import { CallControls } from "../CallControls";
import { CallModal } from "../CallModal";
import { ChatInput } from "../ChatInput";
import { MessageBubble } from "../MessageBubble";
import styles from "./ChatWindow.module.css";

export const ChatWindow: React.FC = () => {
  const dispatch = useDispatch();
  const [isCallModalVisible, setIsCallModalVisible] = useState(false);
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [sending, setSending] = useState(false);
  const { currentConversation, messages } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentConversation) {
      dispatch(fetchMessagesRequest(currentConversation.id));
      dispatch(markMessagesAsRead(currentConversation.id));
    }
  }, [currentConversation, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!currentConversation) return;

    setSending(true);
    try {
      await dispatch(
        sendMessageRequest({
          conversationId: currentConversation.id,
          content,
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
          conversationId: currentConversation.id,
          content: URL.createObjectURL(file),
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
          currentConversation.participants.find((p) => p.id !== user?.id) ||
          currentConversation.participants[0],
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
          currentConversation.participants.find((p) => p.id !== user?.id) ||
          currentConversation.participants[0],
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

  if (!currentConversation) {
    return (
      <div className={styles.emptyState}>
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const otherParticipant = currentConversation.participants.find(
    (participant) => participant.id !== user?.id
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>{otherParticipant?.username || "Nhóm chat"}</h3>
        <CallControls
          onAudioCall={handleAudioCall}
          onVideoCall={handleVideoCall}
          disabled={!currentConversation}
        />
      </div>

      <div className={styles.messageList}>
        {messages[currentConversation.id]?.map((msg) => {
          const sender = currentConversation.participants.find(
            (p) => p.id === msg.sender.id
          );
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
              timestamp={new Date(msg.createdAt).toLocaleTimeString()}
              status={msg.status}
              senderAvatar={sender?.avatar}
              senderName={sender?.username}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        loading={sending}
      />

      <CallModal
        visible={isCallModalVisible}
        type={callType}
        caller={
          currentConversation?.participants.find((p) => p.id !== user?.id) ||
          currentConversation?.participants[0]
        }
        onAnswer={handleAnswerCall}
        onReject={handleRejectCall}
        onEnd={handleEndCall}
        isIncoming={false}
      />
    </div>
  );
};
