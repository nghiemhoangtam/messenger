import { FileOutlined, LoadingOutlined } from "@ant-design/icons";
import React from "react";
import { Avatar } from "../../../../components/atoms/Avatar";
import { Message } from "../../types";
import styles from "./MessageBubble.module.css";

interface MessageBubbleProps {
  content: string;
  type: "text" | "image" | "file" | "audio";
  isOwn: boolean;
  timestamp: string;
  status: Message["status"];
  senderAvatar?: string | null;
  senderName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  type,
  isOwn,
  timestamp,
  status,
  senderAvatar,
  senderName,
}) => {
  const renderContent = () => {
    switch (type) {
      case "image":
        return <img src={content} alt="message" className={styles.image} />;
      case "file":
        return (
          <div className={styles.file}>
            <FileOutlined />
            <span>{content}</span>
          </div>
        );
      case "audio":
        return <audio src={content} controls className={styles.audio} />;
      default:
        return content;
    }
  };

  const renderStatus = () => {
    switch (status) {
      case "sent":
        return "✓";
      case "delivered":
        return "✓✓";
      case "read":
        return "✓✓";
      default:
        return <LoadingOutlined />;
    }
  };

  return (
    <div className={`${styles.container} ${isOwn ? styles.own : ""}`}>
      {!isOwn && (
        <Avatar src={senderAvatar} size={32}>
          {senderName?.[0].toUpperCase()}
        </Avatar>
      )}
      <div className={styles.bubbleWrapper}>
        {!isOwn && senderName && (
          <div className={styles.senderName}>{senderName}</div>
        )}
        <div className={`${styles.bubble} ${styles[type]}`}>
          {renderContent()}
          <div className={styles.metadata}>
            <span className={styles.timestamp}>{timestamp}</span>
            {isOwn && <span className={styles.status}>{renderStatus()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
