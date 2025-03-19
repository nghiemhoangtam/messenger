import { Layout } from "antd";
import React from "react";
import { ChatWindow } from "../components/ChatWindow";
import { ConversationList } from "../components/ConversationList";
import styles from "./ChatPage.module.css";

const { Sider, Content } = Layout;

export const ChatPage: React.FC = () => {
  return (
    <Layout className={styles.chatPage}>
      <Sider width={300} theme="light" className={styles.sider}>
        <ConversationList />
      </Sider>
      <Content className={styles.content}>
        <ChatWindow />
      </Content>
    </Layout>
  );
};
