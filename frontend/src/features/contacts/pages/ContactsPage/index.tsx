import {
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Input, List, message, Modal, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import friendService from "../../../../services/friendService";
import { RootState } from "../../../../store";
import { User } from "../../../../types";
import styles from "./ContactsPage.module.css";

const { TabPane } = Tabs;

export const ContactsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadFriends();
    loadPendingRequests();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const response = await friendService.getFriends();
      setFriends(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách bạn bè");
    } finally {
      setLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const response = await friendService.getPendingRequests();
      setPendingRequests(response.data);
    } catch (error) {
      message.error("Không thể tải yêu cầu kết bạn");
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await friendService.sendFriendRequest(userId);
      message.success("Đã gửi yêu cầu kết bạn");
      setModalVisible(false);
    } catch (error) {
      message.error("Không thể gửi yêu cầu kết bạn");
    }
  };

  const handleAcceptRequest = async (userId: string) => {
    try {
      await friendService.acceptFriendRequest(userId);
      message.success("Đã chấp nhận yêu cầu kết bạn");
      loadFriends();
      loadPendingRequests();
    } catch (error) {
      message.error("Không thể chấp nhận yêu cầu kết bạn");
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      await friendService.rejectFriendRequest(userId);
      message.success("Đã từ chối yêu cầu kết bạn");
      loadPendingRequests();
    } catch (error) {
      message.error("Không thể từ chối yêu cầu kết bạn");
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await friendService.removeFriend(userId);
      message.success("Đã xóa bạn bè");
      loadFriends();
    } catch (error) {
      message.error("Không thể xóa bạn bè");
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Danh bạ</h2>
        <Button
          type="primary"
          icon={<UserAddOutlined />}
          onClick={() => setModalVisible(true)}
        >
          Thêm bạn
        </Button>
      </div>

      <Input
        placeholder="Tìm kiếm bạn bè..."
        prefix={<SearchOutlined />}
        onChange={(e) => handleSearch(e.target.value)}
        className={styles.searchInput}
      />

      <Tabs defaultActiveKey="1">
        <TabPane tab="Bạn bè" key="1">
          <List
            loading={loading}
            dataSource={filteredFriends}
            renderItem={(friend) => (
              <List.Item
                actions={[
                  <Button
                    key="remove"
                    type="text"
                    danger
                    icon={<UserDeleteOutlined />}
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar src={friend.avatar} icon={<UserOutlined />} />
                  }
                  title={friend.username}
                  description={
                    friend.status === "online"
                      ? "Đang trực tuyến"
                      : "Ngoại tuyến"
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane
          tab={
            <span>
              Yêu cầu kết bạn{" "}
              {pendingRequests.length > 0 && (
                <Badge count={pendingRequests.length} />
              )}
            </span>
          }
          key="2"
        >
          <List
            dataSource={pendingRequests}
            renderItem={(user) => (
              <List.Item
                actions={[
                  <Button
                    key="accept"
                    type="primary"
                    onClick={() => handleAcceptRequest(user.id)}
                  >
                    Chấp nhận
                  </Button>,
                  <Button
                    key="reject"
                    danger
                    onClick={() => handleRejectRequest(user.id)}
                  >
                    Từ chối
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={user.avatar} icon={<UserOutlined />} />}
                  title={user.username}
                  description="Muốn kết bạn với bạn"
                />
              </List.Item>
            )}
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Thêm bạn bè"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Input.Search
          placeholder="Nhập tên người dùng..."
          onSearch={(value) => {
            // Implement user search logic here
            setSelectedUser({
              id: "1",
              username: value,
              email: "example@email.com",
              avatar: null,
              status: "offline",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }}
        />
        {selectedUser && (
          <List.Item
            actions={[
              <Button
                key="add"
                type="primary"
                onClick={() => handleAddFriend(selectedUser.id)}
              >
                Gửi yêu cầu
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={selectedUser.username}
            />
          </List.Item>
        )}
      </Modal>
    </div>
  );
};
