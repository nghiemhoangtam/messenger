import React from "react";
import { Avatar } from "../../atoms/Avatar";
import styles from "./UserCard.module.css";

interface UserCardProps {
  username: string;
  avatar?: string;
  status?: "online" | "offline";
  lastSeen?: string;
  onClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  username,
  avatar,
  status,
  lastSeen,
  onClick,
}) => {
  return (
    <div className={styles.userCard} onClick={onClick}>
      <Avatar src={avatar} status={status} size={40}>
        {!avatar && username[0].toUpperCase()}
      </Avatar>
      <div className={styles.info}>
        <div className={styles.name}>{username}</div>
        {lastSeen && (
          <div className={styles.lastSeen}>
            {status === "online" ? "Đang hoạt động" : `Hoạt động ${lastSeen}`}
          </div>
        )}
      </div>
    </div>
  );
};
