import { PhoneOutlined } from "@ant-design/icons";
import { Avatar, Button, Modal, Space } from "antd";
import React from "react";
import styles from "./CallModal.module.css";

interface CallModalProps {
  visible: boolean;
  type: "audio" | "video";
  caller: {
    id: string;
    username: string;
    avatar?: string;
  };
  onAnswer: () => void;
  onReject: () => void;
  onEnd: () => void;
  isIncoming?: boolean;
}

export const CallModal: React.FC<CallModalProps> = ({
  visible,
  type,
  caller,
  onAnswer,
  onReject,
  onEnd,
  isIncoming = false,
}) => {
  return (
    <Modal
      visible={visible}
      footer={null}
      closable={false}
      centered
      className={styles.modal}
      width={400}
    >
      <div className={styles.content}>
        <div className={styles.avatar}>
          <Avatar size={100} src={caller.avatar}>
            {caller.username[0]}
          </Avatar>
        </div>
        <div className={styles.name}>{caller.username}</div>
        <div className={styles.status}>
          {isIncoming ? "Đang gọi đến..." : "Đang gọi..."}
        </div>
        <Space className={styles.controls}>
          {isIncoming ? (
            <>
              <Button
                type="primary"
                danger
                shape="circle"
                icon={<PhoneOutlined />}
                onClick={onReject}
                className={styles.rejectButton}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<PhoneOutlined />}
                onClick={onAnswer}
                className={styles.answerButton}
              />
            </>
          ) : (
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<PhoneOutlined />}
              onClick={onEnd}
              className={styles.endButton}
            />
          )}
        </Space>
      </div>
    </Modal>
  );
};
