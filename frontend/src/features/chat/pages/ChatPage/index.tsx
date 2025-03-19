import { MenuOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Avatar, Button, Drawer, Input, Layout } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { fetchConversationsRequest } from "../../chatSlice";
import { ChatWindow } from "../../components/ChatWindow";
import { ConversationList } from "../../components/ConversationList";
import styles from "./ChatPage.module.css";

const { Header, Sider, Content } = Layout;
const { Search } = Input;

export const ChatPage: React.FC = () => {
  const dispatch = useDispatch();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentConversation } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(fetchConversationsRequest());
  }, [dispatch]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleNewChat = () => {
    // TODO: Implement new chat functionality
  };

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={() => setDrawerVisible(true)}
          className={styles.menuButton}
        />
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Messenger</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewChat}
            className={styles.newChatButton}
          >
            Cuộc trò chuyện mới
          </Button>
        </div>
      </Header>

      <Layout>
        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          width={300}
        >
          <div className={styles.drawerContent}>
            <Search
              placeholder="Tìm kiếm cuộc trò chuyện..."
              allowClear
              onSearch={handleSearch}
              className={styles.searchInput}
            />
            <ConversationList />
          </div>
        </Drawer>

        <Content className={styles.content}>
          {currentConversation ? (
            <ChatWindow />
          ) : (
            <div className={styles.emptyState}>
              <Avatar size={64} icon={<SearchOutlined />} />
              <h2>Chọn một cuộc trò chuyện</h2>
              <p>Hoặc bắt đầu một cuộc trò chuyện mới</p>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleNewChat}
              >
                Cuộc trò chuyện mới
              </Button>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};
