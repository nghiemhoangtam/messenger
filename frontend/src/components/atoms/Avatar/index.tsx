import { Avatar as AntAvatar } from "antd";
import { AvatarProps } from "antd/lib/avatar";
import React from "react";
import styles from "./Avatar.module.css";

interface CustomAvatarProps extends AvatarProps {
  status?: "online" | "offline";
}

export const Avatar: React.FC<CustomAvatarProps> = ({
  status,
  className,
  children,
  ...props
}) => {
  return (
    <div className={styles.avatarWrapper}>
      <AntAvatar className={`${styles.avatar} ${className || ""}`} {...props}>
        {children}
      </AntAvatar>
      {status && <span className={`${styles.status} ${styles[status]}`} />}
    </div>
  );
};
