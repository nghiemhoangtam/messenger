import {
  SearchOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Badge, Button, Input, List, message, Modal, Tabs } from "antd";
import React, { startTransition, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import friendService from "../../../../services/friendService";
import { RootState } from "../../../../store";
import { PaginationRequest } from "../../../../types/pagination-request";
import { User } from "../../../auth";
import {
  fetchAcceptedFriendsRequest,
  fetchReceiveFriendsRequest,
  searchFriendsRequest
} from "../../contactsSlice";
import { Contact } from "../../types";
import styles from "./ContactsPage.module.css";

const { TabPane } = Tabs;

export const ContactsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const contactState = useSelector((state: RootState) => state.contact);

  const friends: Contact[] = contactState.acceptedFriendPagination.results;
  const pendingRequests: Contact[] =
    contactState.receivedFriendPagination.results;

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadAcceptedFriends();
    loadReceiveRequestFriends();
  }, []);

  useEffect(() => {
    dispatch(searchFriendsRequest(new PaginationRequest({
      page: 1,
      search: searchQuery
    })));
  }, [searchQuery]);

  const loadAcceptedFriends = async () => {
    dispatch(
      fetchAcceptedFriendsRequest(
        new PaginationRequest({
          page: contactState.acceptedFriendPagination.meta.page + 1,
          search: searchQuery
        })
      )
    );
  };

  const loadReceiveRequestFriends = async () => {
    dispatch(
      fetchReceiveFriendsRequest(
        new PaginationRequest({
          page: contactState.receivedFriendPagination.meta.page + 1,
        })
      )
    );
  };

  const handleSearch = (value: string) => {
    startTransition(() => {
      setSearchQuery(value);
    });
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
      loadAcceptedFriends();
      loadReceiveRequestFriends();
    } catch (error) {
      message.error("Không thể chấp nhận yêu cầu kết bạn");
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      await friendService.rejectFriendRequest(userId);
      message.success("Đã từ chối yêu cầu kết bạn");
      loadReceiveRequestFriends();
    } catch (error) {
      message.error("Không thể từ chối yêu cầu kết bạn");
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      await friendService.removeFriend(userId);
      message.success("Đã xóa bạn bè");
      loadAcceptedFriends();
    } catch (error) {
      message.error("Không thể xóa bạn bè");
    }
  };

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
            loading={contactState.status === "loading"}
            dataSource={friends}
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
                  title={friend.display_name}
                  description={
                    friend.status === "online"
                      ? "Đang trực tuyến"
                      : "Ngoại tuyến"
                  }
                />
              </List.Item>
            )}
          />
          {friends.length !==
            contactState.acceptedFriendPagination.meta.total && (
            <Button type="primary" onClick={() => loadAcceptedFriends()}>
              Load more friends
            </Button>
          )}
        </TabPane>
        <TabPane
          tab={
            <span>
              Yêu cầu kết bạn{" "}
              {contactState.receivedFriendPagination.meta.total > 0 && (
                <Badge
                  count={contactState.receivedFriendPagination.meta.total}
                />
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
                  title={user.display_name}
                  description="Muốn kết bạn với bạn"
                />
              </List.Item>
            )}
          />
          {pendingRequests.length !==
            contactState.receivedFriendPagination.meta.total && (
            <Button type="primary" onClick={() => loadReceiveRequestFriends()}>
              Load more requests
            </Button>
          )}
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
              email: value,
              display_name: value,
              avatar: null,
              status: "offline",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
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
              title={selectedUser.avatar}
            />
          </List.Item>
        )}
      </Modal>
    </div>
  );
};
