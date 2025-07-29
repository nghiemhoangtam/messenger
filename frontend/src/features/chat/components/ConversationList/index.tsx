import { LoginOutlined, UserAddOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Input, List, Modal, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { roomService } from "../../../../services/roomService";
import { RootState } from "../../../../store";
import { PaginationRequest } from "../../../../types/pagination-request";
import { Contact } from "../../../contacts/types";
import {
  createGroupRoomRequest,
  createPrivateRoomRequest,
  fetchConversationsRequest,
  getAvailableFriendsRequest,
  resetCreateGroupRoom,
  resetCreatePrivateRoom,
  resetSearchGroupUser,
  searchGroupUserRequest
} from "../../chatSlice";
import { Conversation } from "../../types";
import styles from "./ConversationList.module.css";

// usePrevious hook must be outside the component and not inside any function
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const { Option } = Select;

export const ConversationList: React.FC = () => {
  const dispatch = useDispatch();
  const [searchGroupUserQuery, setSearchGroupUserQuery] = useState('');
  const { roomPage, currentConversation, createGroupRoom, createPrivateRoom, newSearchGroupUser, availableFriends } = useSelector(
    (state: RootState) => state.chat
  );
  const { user } = useSelector((state: RootState) => state.auth);  

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [privateModalVisible, setPrivateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [privateForm] = Form.useForm();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinForm] = Form.useForm();
  const [joining, setJoining] = useState(false);
  const prevLoading = usePrevious(createGroupRoom.loading);

  useEffect(() => {
    dispatch(fetchConversationsRequest(new PaginationRequest({ page: 1, limit: 20 })));
    dispatch(getAvailableFriendsRequest(new PaginationRequest({ page: 1, limit: 10 })));
  }, [dispatch]);

  // Khi mở modal tạo nhóm, reset và fetch user page 1
  useEffect(() => {
    if (modalVisible) {
      dispatch(resetSearchGroupUser());
      dispatch(searchGroupUserRequest(new PaginationRequest({ page: 1, search: "" })));
    }
  }, [modalVisible, dispatch]);

  useEffect(() => {
    if (
      prevLoading && // was loading
      !createGroupRoom.loading && // now not loading
      modalVisible
    ) {
      setModalVisible(false);
      form.resetFields();
    }
  }, [createGroupRoom.loading, modalVisible, form, prevLoading]);

  useEffect(() => {
    if (
      prevLoading && // was loading
      !createPrivateRoom.loading && // now not loading
      privateModalVisible
    ) {
      setPrivateModalVisible(false);
      privateForm.resetFields();
    }
  }, [createPrivateRoom.loading, privateModalVisible, privateForm, prevLoading]);

  useEffect(() => {
    if(createGroupRoom.error) {
      message.error(createGroupRoom.error);
      dispatch(resetCreateGroupRoom());
    }
  }, [createGroupRoom.error, dispatch]);

  useEffect(() => {
    if (createPrivateRoom.error) {
      message.error(createPrivateRoom.error);
      dispatch(resetCreatePrivateRoom());
    }
  }, [createPrivateRoom.error, dispatch]);

  const handleConversationClick = (conversationId: string) => {
    const conversation = roomPage.data.results.find((c) => c.room.id === conversationId);
    if (conversation) {
      // dispatch(setCurrentConversation(conversation));
    }
  };

  const showCreateGroupModal = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleCreateGroup = async (values: any) => {
    dispatch(createGroupRoomRequest({
      name: values.name,
      members: values.members
    }));
    // setModalVisible(false); // This line is removed
  };

  const showCreatePrivateModal = () => {
    setPrivateModalVisible(true);
    privateForm.resetFields();
  };

  const handleCreatePrivate = async (values: any) => {
    dispatch(createPrivateRoomRequest(values.memberId));
    setPrivateModalVisible(false);
  };

  const showJoinModal = () => {
    setJoinModalVisible(true);
    joinForm.resetFields();
  };

  const handleJoinRoom = async (values: any) => {
    setJoining(true);
    try {
      await roomService.joinRoom(values.roomId);
      message.success("Tham gia phòng thành công");
      setJoinModalVisible(false);
      dispatch(fetchConversationsRequest(new PaginationRequest({ page: 1, limit: 10 })));
    } catch (err) {
      message.error("Tham gia phòng thất bại");
    } finally {
      setJoining(false);
    }
  };

  // Khi search user
  const handleSearchGroupUser = (value: string) => {
    setSearchGroupUserQuery(value);
    dispatch(searchGroupUserRequest(new PaginationRequest({ page: 1, search: value })));
  };

  // Khi scroll tới cuối danh sách user
  const handleSearchGroupUserScroll = (e: any) => {
    const target = e.target;
    if (
      !newSearchGroupUser.loading &&
      newSearchGroupUser.data.results.length < newSearchGroupUser.data.meta.total &&
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 32
    ) {
      dispatch(
        searchGroupUserRequest(
          new PaginationRequest({ page: newSearchGroupUser.data.meta.page + 1, search: searchGroupUserQuery })
        )
      );
    }
  };

  const listRef = React.useRef<HTMLDivElement>(null);

  const handleConversationListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 32
      && !roomPage.loading // nếu có biến loading
      && roomPage.data.results.length < roomPage.data.meta.total // nếu có phân trang
    ) {
      dispatch(fetchConversationsRequest(new PaginationRequest({ page: roomPage.data.meta.page + 1, limit: 20 })));
    }
  };

  const handleSearchFriendScroll = (e: any) => {
    const target = e.target;
    if (
      !availableFriends.loading &&
      availableFriends.data.results.length < availableFriends.data.meta.total &&
      target.scrollTop + target.offsetHeight >= target.scrollHeight - 32
    ) {
      dispatch(
        getAvailableFriendsRequest(
          new PaginationRequest({ page: availableFriends.data.meta.page + 1, limit: 10 })
        )
      );
    }
  };

      return (
    <div className={styles.conversationList}>
      <div className={styles.actionBar}>
        <Button
          className={styles.actionButton}
          icon={<UsergroupAddOutlined />}
          onClick={showCreateGroupModal}
        >
          Nhóm
        </Button>
        <Button
          className={styles.actionButton}
          icon={<UserAddOutlined />}
          onClick={showCreatePrivateModal}
        >
          Riêng tư
        </Button>
        <Button
          className={styles.actionButton}
          icon={<LoginOutlined />}
          onClick={showJoinModal}
        >
          Tham gia
        </Button>
      </div>
      <div
        ref={listRef}
        className={styles.listWrapper}
        onScroll={handleConversationListScroll}
      >
        <List          
          dataSource={roomPage.data.results}
          renderItem={(conversation: Conversation) => {
            const isActive = currentConversation?.room.id === conversation.room.id;
            return (
              <List.Item
                style={{
                  padding: "10px",
                }}
                className={`${styles.conversationItem} ${
                  isActive ? styles.active : ""
                }`}
                onClick={() => handleConversationClick(conversation.room.id)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={conversation.unread_count}>
                      <Avatar src={conversation.room.avatar}>
                        {conversation.room.name?.[0].toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                  title={conversation.room.name || "Nhóm chat"}
                  description={
                    <div className={styles.lastMessage}>
                      {conversation.lastMessage?.content}
                    </div>
                  }
                />
                {conversation.lastMessage && (
                  <div className={styles.messageTime}>
                    {new Date(
                      conversation.lastMessage.created_at
                    ).toLocaleTimeString()}
                  </div>
                )}
              </List.Item>
            );
          }}
        />
      </div>
      {/* Modal tạo nhóm chat */}
      <Modal
        title="Tạo nhóm chat mới"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        confirmLoading={createGroupRoom.loading}
        okText="Tạo nhóm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreateGroup}>
          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: "Nhập tên nhóm" }]}
          >
            <Input placeholder="Nhập tên nhóm" />
          </Form.Item>
          <Form.Item
            name="members"
            label="Thành viên"
            rules={[{ required: true, message: "Chọn thành viên" }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn thành viên"
              optionFilterProp="children"
              showSearch
              filterOption={false}
              onSearch={handleSearchGroupUser}
              onPopupScroll={handleSearchGroupUserScroll}
              loading={newSearchGroupUser.loading}
              notFoundContent={
                newSearchGroupUser.loading
                  ? "Đang tải..."
                  : "Không tìm thấy người dùng"
              }
            >
              {newSearchGroupUser.data.results
                .filter((m: Contact) => m.id !== user?.id)
                .map((m: Contact) => (
                  <Option key={m.id} value={m.id}>
                    {m.display_name} ({m.email})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal tạo chat riêng tư */}
      <Modal
        title="Tạo chat riêng tư"
        visible={privateModalVisible}
        onCancel={() => setPrivateModalVisible(false)}
        onOk={() => privateForm.submit()}
        confirmLoading={createPrivateRoom.loading}
        okText="Tạo chat"
        cancelText="Hủy"
      >
        <Form
          form={privateForm}
          layout="vertical"
          onFinish={handleCreatePrivate}
        >
          <Form.Item
            name="memberId"
            label="Chọn người dùng"
            rules={[{ required: true, message: "Chọn người dùng" }]}
          >
            <Select
              placeholder="Chọn người dùng"
              optionFilterProp="children"
              onPopupScroll={handleSearchFriendScroll}
              loading={availableFriends.loading}
              notFoundContent={
                availableFriends.loading
                  ? "Đang tải..."
                  : "Không tìm thấy người dùng"
              }
              showSearch
              filterOption={(input, option) =>
                String(option?.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {availableFriends.data.results
                .filter((u: Contact) => u.id !== user?.id)
                .map((u: Contact) => (
                  <Option key={u.id} value={u.id}>
                    {u.display_name} ({u.email})
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      {/* Modal tham gia phòng */}
      <Modal
        title="Tham gia phòng bằng Room ID"
        visible={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        onOk={() => joinForm.submit()}
        confirmLoading={joining}
        okText="Tham gia"
        cancelText="Hủy"
      >
        <Form form={joinForm} layout="vertical" onFinish={handleJoinRoom}>
          <Form.Item
            name="roomId"
            label="Room ID"
            rules={[{ required: true, message: "Nhập Room ID" }]}
          >
            <Input placeholder="Nhập Room ID" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
