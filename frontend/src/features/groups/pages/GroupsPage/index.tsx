import {
  DeleteOutlined,
  EditOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Form,
  Input,
  List,
  message,
  Modal,
  Select,
  Tabs,
  Tag,
  Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import groupService from "../../../../services/groupService";
import { RootState } from "../../../../store";
import { Group, User } from "../../../../types";
import styles from "./GroupsPage.module.css";

const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

export const GroupsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState("1");
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<User | null>(null);

  const dispatch = useDispatch();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await groupService.getGroups();
      setGroups(response.data);
    } catch (error) {
      message.error("Không thể tải danh sách nhóm");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateGroup = async (values: any) => {
    try {
      await groupService.createGroup(values);
      message.success("Đã tạo nhóm thành công");
      setModalVisible(false);
      form.resetFields();
      loadGroups();
    } catch (error) {
      message.error("Không thể tạo nhóm");
    }
  };

  const handleUpdateGroup = async (values: any) => {
    if (!selectedGroup) return;
    try {
      await groupService.updateGroup(selectedGroup.id, values);
      message.success("Đã cập nhật nhóm thành công");
      setModalVisible(false);
      form.resetFields();
      loadGroups();
    } catch (error) {
      message.error("Không thể cập nhật nhóm");
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    try {
      await groupService.deleteGroup(groupId);
      message.success("Đã xóa nhóm thành công");
      loadGroups();
    } catch (error) {
      message.error("Không thể xóa nhóm");
    }
  };

  const handleAddMember = async (groupId: string, userId: string) => {
    try {
      await groupService.addMember(groupId, userId);
      message.success("Đã thêm thành viên thành công");
      loadGroups();
    } catch (error) {
      message.error("Không thể thêm thành viên");
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    try {
      await groupService.removeMember(groupId, userId);
      message.success("Đã xóa thành viên thành công");
      loadGroups();
    } catch (error) {
      message.error("Không thể xóa thành viên");
    }
  };

  const handleUpdateMemberRole = async (
    groupId: string,
    userId: string,
    role: string
  ) => {
    try {
      await groupService.updateMemberRole(groupId, userId, role);
      message.success("Đã cập nhật vai trò thành công");
      loadGroups();
    } catch (error) {
      message.error("Không thể cập nhật vai trò");
    }
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showCreateModal = () => {
    setSelectedGroup(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (group: Group) => {
    setSelectedGroup(group);
    form.setFieldsValue(group);
    setModalVisible(true);
  };

  const showGroupInfo = (group: Group) => {
    setSelectedGroup(group);
    setActiveTab("2");
  };

  const renderGroupInfo = (group: Group) => (
    <div className={styles.groupInfo}>
      <div className={styles.groupHeader}>
        <Avatar size={64} src={group.avatar} icon={<TeamOutlined />} />
        <div className={styles.groupDetails}>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </div>
      </div>

      <div className={styles.memberList}>
        <h4>Thành viên ({group.members.length})</h4>
        <Input.Search
          placeholder="Tìm kiếm thành viên..."
          onChange={(e) => setMemberSearchQuery(e.target.value)}
          className={styles.memberSearch}
        />
        <List
          dataSource={group.members.filter((member) =>
            member.username
              .toLowerCase()
              .includes(memberSearchQuery.toLowerCase())
          )}
          renderItem={(member) => (
            <List.Item
              actions={[
                <Select
                  defaultValue={member.role}
                  onChange={(value) =>
                    handleUpdateMemberRole(group.id, member.userId, value)
                  }
                >
                  <Option value="admin">Quản trị viên</Option>
                  <Option value="moderator">Điều hành viên</Option>
                  <Option value="member">Thành viên</Option>
                </Select>,
                <Button
                  type="text"
                  danger
                  icon={<UserDeleteOutlined />}
                  onClick={() => handleRemoveMember(group.id, member.userId)}
                >
                  Xóa
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={member.avatar} icon={<UserOutlined />} />}
                title={member.username}
                description={member.role}
              />
            </List.Item>
          )}
        />
      </div>

      <div className={styles.addMember}>
        <h4>Thêm thành viên</h4>
        <Input.Search
          placeholder="Tìm kiếm người dùng..."
          onSearch={(value) => {
            // Implement user search logic here
            setSelectedMember({
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
        {selectedMember && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => handleAddMember(group.id, selectedMember.id)}
          >
            Thêm {selectedMember.username}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Quản lý nhóm</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showCreateModal}
        >
          Tạo nhóm
        </Button>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Danh sách nhóm" key="1">
          <Input
            placeholder="Tìm kiếm nhóm..."
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            className={styles.searchInput}
          />

          <List
            loading={loading}
            dataSource={filteredGroups}
            renderItem={(group) => (
              <List.Item
                actions={[
                  <Tooltip title="Xem thông tin">
                    <Button
                      type="text"
                      icon={<InfoCircleOutlined />}
                      onClick={() => showGroupInfo(group)}
                    />
                  </Tooltip>,
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => showEditModal(group)}
                  >
                    Chỉnh sửa
                  </Button>,
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDeleteGroup(group.id)}
                  >
                    Xóa
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={group.avatar} icon={<TeamOutlined />} />}
                  title={group.name}
                  description={
                    <div>
                      <p>{group.description}</p>
                      <div>
                        <Tag color="blue">
                          {group.members.length} thành viên
                        </Tag>
                        <Tag color="green">{group.type}</Tag>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>

        <TabPane tab="Thông tin nhóm" key="2">
          {selectedGroup ? (
            renderGroupInfo(selectedGroup)
          ) : (
            <div className={styles.emptyState}>
              <p>Vui lòng chọn một nhóm để xem thông tin</p>
            </div>
          )}
        </TabPane>
      </Tabs>

      <Modal
        title={selectedGroup ? "Chỉnh sửa nhóm" : "Tạo nhóm mới"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={selectedGroup ? handleUpdateGroup : handleCreateGroup}
        >
          <Form.Item
            name="name"
            label="Tên nhóm"
            rules={[{ required: true, message: "Vui lòng nhập tên nhóm" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item name="type" label="Loại nhóm">
            <Select defaultValue="public">
              <Option value="public">Công khai</Option>
              <Option value="private">Riêng tư</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {selectedGroup ? "Cập nhật" : "Tạo nhóm"}
            </Button>
            <Button
              onClick={() => setModalVisible(false)}
              style={{ marginLeft: 8 }}
            >
              Hủy
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
