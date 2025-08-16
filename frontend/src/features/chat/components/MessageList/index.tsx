import React from "react";
import { Message } from "../../types";
import { EditableMessageBubble } from "../EditableMessageBubble";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => Promise<void>;
  onReplyClick?: (message: Message) => void;
  onScrollToMessage?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onReplyClick,
  onScrollToMessage,
}) => {
  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <EditableMessageBubble
          key={message.id}
          message={message}
          isOwn={message.sender.id === currentUserId}
          onEditMessage={onEditMessage}
          onDeleteMessage={onDeleteMessage}
          onReplyClick={onReplyClick}
          onScrollToMessage={onScrollToMessage}
        />
      ))}
    </div>
  );
};
