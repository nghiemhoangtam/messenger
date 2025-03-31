import { PhoneOutlined, VideoCameraOutlined } from "@ant-design/icons";
import React from "react";
import { Avatar } from "../../atoms/Avatar";
import styles from "./CallCard.module.css";

interface CallCardProps {
  username: string;
  avatar?: string | null;
  type: "audio" | "video";
  status: "ringing" | "ongoing" | "ended" | "missed" | "incoming" | "outgoing";
  timestamp: string;
  duration?: string;
  onClick?: () => void;
}

export const CallCard: React.FC<CallCardProps> = ({
  username,
  avatar,
  type,
  status,
  timestamp,
  duration,
  onClick,
}) => {
  const getStatusText = () => {
    switch (status) {
      case "missed":
        return "Cuộc gọi nhỡ";
      case "incoming":
        return `Cuộc gọi đến • ${duration || ""}`;
      case "outgoing":
        return `Cuộc gọi đi • ${duration || ""}`;
      default:
        return "";
    }
  };

  return (
    <div className={`${styles.callCard} ${styles[status]}`} onClick={onClick}>
      <Avatar src={avatar} size={40}>
        {!avatar && username[0].toUpperCase()}
      </Avatar>
      <div className={styles.info}>
        <div className={styles.name}>{username}</div>
        <div className={styles.details}>
          {type === "video" ? <VideoCameraOutlined /> : <PhoneOutlined />}
          <span>{getStatusText()}</span>
        </div>
      </div>
      <div className={styles.time}>{timestamp}</div>
    </div>
  );
};
