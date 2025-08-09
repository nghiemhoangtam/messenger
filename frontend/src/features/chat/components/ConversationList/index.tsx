import { CopyOutlined, LoginOutlined, UserAddOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Badge, Button, Form, Input, List, message, Modal, Select, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Loading from "../../../../components/atoms/Loading/Loading";
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
  searchGroupUserRequest,
  setCurrentConversation
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
  const [loadingConversations, setLoadingConversations] = useState(false);
  const {
    roomPage,
    currentConversation,
    createGroupRoom,
    createPrivateRoom,
    newSearchGroupUser,
    availableFriends,
  } = useSelector((state: RootState) => state.chat);
  const { user } = useSelector((state: RootState) => state.auth);  

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [privateModalVisible, setPrivateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [privateForm] = Form.useForm();
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinForm] = Form.useForm();
  const [joining, setJoining] = useState(false);
  const [checkingRoom, setCheckingRoom] = useState(false);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const prevLoading = usePrevious(createGroupRoom.loading);

  useEffect(() => {
    setLoadingConversations(true);
    dispatch(fetchConversationsRequest(new PaginationRequest({ page: 1, limit: 15 })));
    dispatch(getAvailableFriendsRequest(new PaginationRequest({ page: 1, limit: 10 })));
  }, [dispatch]);

  // Sync local loading state with Redux loading state
  useEffect(() => {
    setLoadingConversations(roomPage.loading);
  }, [roomPage.loading]);

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
      dispatch(setCurrentConversation(conversation));
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

  const handleCheckRoom = async (roomId: string) => {
    setCheckingRoom(true);
    try {
      const info = await roomService.getRoomInfo(roomId);
      setRoomInfo(info);
      
      if (!info.can_join) {
        if (info.is_member) {
          message.warning("Bạn đã là thành viên của phòng này");
        } else if (info.type !== 'group') {
          message.error("Chỉ có thể tham gia phòng nhóm");
        } else if (info.current_members >= info.max_members) {
          message.error("Phòng đã đầy thành viên");
        }
      }
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Không tìm thấy phòng");
      setRoomInfo(null);
    } finally {
      setCheckingRoom(false);
    }
  };

  const handleJoinRoom = async (values: any) => {
    setJoining(true);
    try {
      await roomService.joinRoom(values.roomId);
      message.success("Tham gia phòng thành công");
      setJoinModalVisible(false);
      setRoomInfo(null);
      joinForm.resetFields();
      dispatch(fetchConversationsRequest(new PaginationRequest({ page: 1, limit: 10 })));
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Tham gia phòng thất bại";
      message.error(errorMessage);
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
      dispatch(fetchConversationsRequest(new PaginationRequest({ page: roomPage.data.meta.page + 1, limit: 15 })));
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

  const handleCopyRoomId = async (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering conversation click
    try {
      await navigator.clipboard.writeText(roomId);
      message.success("Đã copy Room ID vào clipboard");
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        message.success("Đã copy Room ID vào clipboard");
      } catch (fallbackErr) {
        message.error("Không thể copy Room ID");
      }
      document.body.removeChild(textArea);
    }
  };

  // Show loading when conversations are being loaded initially
  if (loadingConversations && roomPage.data.results.length === 0) {
    return (
      <div className={styles.conversationList}>
        <Loading local={true} />
      </div>
    );
  }

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
            const isGroupRoom = conversation.room.type === 'group';
            
            // Debug logging
            console.log(`[DEBUG] Conversation: ${conversation.room.name}, type: ${conversation.room.type}, isGroupRoom: ${isGroupRoom}`);
            
            return (
              <List.Item
                style={{
                  padding: "10px",
                }}
                className={`${styles.conversationItem} ${
                  isActive ? styles.active : ""
                } ${isGroupRoom ? styles.groupRoom : ""}`}
                onClick={() => handleConversationClick(conversation.room.id)}
              >
                {isGroupRoom && <div className={styles.groupRoomIndicator}></div>}
                <List.Item.Meta
                  avatar={
                    <Badge count={conversation.unread_count}>
                      <Avatar src={conversation.room.avatar}>
                        {conversation.room.name?.[0].toUpperCase()}
                      </Avatar>
                    </Badge>
                  }
                  title={
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ 
                        fontWeight: isGroupRoom ? '600' : '400', 
                        color: isGroupRoom ? '#1890ff' : 'inherit',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {conversation.room.name || "Nhóm chat"}
                        {isGroupRoom && (
                          <span style={{ 
                            fontSize: '12px', 
                            color: '#1890ff',
                            background: 'rgba(24, 144, 255, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: '500'
                          }}>
                            👥 Nhóm
                          </span>
                        )}
                      </span>
                      {isGroupRoom && (
                        <Tooltip title="Copy Room ID">
                          <Button
                            type="text"
                            size="small"
                            icon={<CopyOutlined />}
                            onClick={(e) => handleCopyRoomId(conversation.room.id, e)}
                            className={styles.copyButton}
                            style={{ opacity: 0.3 }}
                          />
                        </Tooltip>
                      )}
                    </div>
                  }
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
        {/* Show loading indicator at bottom when loading more conversations */}
        {roomPage.loading && roomPage.data.results.length > 0 && (
          <Loading local={true} />
        )}
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
        onCancel={() => {
          setJoinModalVisible(false);
          setRoomInfo(null);
          joinForm.resetFields();
        }}
        onOk={() => joinForm.submit()}
        confirmLoading={joining}
        okText="Tham gia"
        cancelText="Hủy"
        okButtonProps={{ disabled: !roomInfo?.can_join }}
      >
        <Form form={joinForm} layout="vertical" onFinish={handleJoinRoom}>
          <Form.Item
            name="roomId"
            label="Room ID"
            rules={[{ required: true, message: "Nhập Room ID" }]}
          >
            <Input 
              placeholder="Nhập Room ID" 
              onPressEnter={(e) => {
                const roomId = e.currentTarget.value;
                if (roomId) {
                  handleCheckRoom(roomId);
                }
              }}
              suffix={
                <Button 
                  type="text" 
                  size="small" 
                  loading={checkingRoom}
                  onClick={() => {
                    const roomId = joinForm.getFieldValue('roomId');
                    if (roomId) {
                      handleCheckRoom(roomId);
                    }
                  }}
                >
                  Kiểm tra
                </Button>
              }
            />
          </Form.Item>
        </Form>

        {/* Room Info Preview */}
        {roomInfo && (
          <div style={{ marginTop: 16, padding: 16, border: '1px solid #d9d9d9', borderRadius: 6 }}>
            <h4 style={{ marginBottom: 12 }}>Thông tin phòng</h4>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <Avatar 
                src={roomInfo.avatar} 
                size={40}
                style={{ marginRight: 12 }}
              >
                {roomInfo.name?.charAt(0)}
              </Avatar>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: 16 }}>{roomInfo.name}</div>
                <div style={{ color: '#666', fontSize: 12 }}>
                  {roomInfo.type === 'group' ? 'Nhóm' : 'Riêng tư'}
                </div>
              </div>
            </div>
            
            {roomInfo.description && (
              <div style={{ marginBottom: 8, color: '#666' }}>
                {roomInfo.description}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
              <span>Thành viên: {roomInfo.current_members}/{roomInfo.max_members}</span>
              <span>Tạo bởi: {roomInfo.creator?.display_name}</span>
            </div>
            
            {roomInfo.is_encrypted && (
              <div style={{ marginTop: 8, color: '#52c41a', fontSize: 12 }}>
                🔒 Tin nhắn được mã hóa
              </div>
            )}
            
            {!roomInfo.can_join && (
              <div style={{ marginTop: 8, color: '#ff4d4f', fontSize: 12 }}>
                {roomInfo.is_member ? 'Bạn đã là thành viên' : 
                 roomInfo.type !== 'group' ? 'Chỉ có thể tham gia phòng nhóm' :
                 'Phòng đã đầy thành viên'}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
