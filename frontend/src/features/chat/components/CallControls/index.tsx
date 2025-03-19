import { AudioOutlined, VideoCameraOutlined } from "@ant-design/icons";
import { Button, Space, Tooltip } from "antd";
import React from "react";
import styles from "./CallControls.module.css";

interface CallControlsProps {
  onAudioCall: () => void;
  onVideoCall: () => void;
  disabled?: boolean;
}

export const CallControls: React.FC<CallControlsProps> = ({
  onAudioCall,
  onVideoCall,
  disabled = false,
}) => {
  return (
    <Space className={styles.controls}>
      <Tooltip title="Gọi điện thoại">
        <Button
          type="text"
          icon={<AudioOutlined />}
          onClick={onAudioCall}
          disabled={disabled}
          className={styles.audioButton}
        />
      </Tooltip>
      <Tooltip title="Gọi video">
        <Button
          type="text"
          icon={<VideoCameraOutlined />}
          onClick={onVideoCall}
          disabled={disabled}
          className={styles.videoButton}
        />
      </Tooltip>
    </Space>
  );
};
