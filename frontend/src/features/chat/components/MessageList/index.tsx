import { AudioOutlined, FileOutlined } from "@ant-design/icons";
import { Image } from "antd";
import React from "react";
import { Message } from "../../types";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
}) => {
  const renderMessage = (message: Message) => {
    const isCurrentUser = message.sender.id === currentUserId;
    const messageClass = isCurrentUser ? styles.sent : styles.received;

    const renderContent = () => {
      const messageType = message.content.startsWith("data:image")
        ? "image"
        : message.content.startsWith("data:audio")
        ? "audio"
        : message.content.startsWith("data:application")
        ? "file"
        : "text";

      switch (messageType) {
        case "image":
          return (
            <div className={styles.imageContainer}>
              <Image src={message.content} alt="Image message" />
            </div>
          );
        case "file":
          return (
            <a
              href={message.content}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.fileMessage}
            >
              <FileOutlined /> {message.content}
            </a>
          );
        case "audio":
          return (
            <div className={styles.audioMessage}>
              <AudioOutlined />
              <audio controls src={message.content}>
                Your browser does not support the audio element.
              </audio>
            </div>
          );
        default:
          return <span>{message.content}</span>;
      }
    };

    return (
      <div key={message.id} className={`${styles.message} ${messageClass}`}>
        <div className={styles.messageContent}>{renderContent()}</div>
        <div className={styles.messageTime}>
          {new Date(message.createdAt).toLocaleTimeString()}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.messageList}>
      {messages.map((message) => renderMessage(message))}
    </div>
  );
};
