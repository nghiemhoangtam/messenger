import {
  ContactsOutlined,
  MessageOutlined,
  PhoneOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import styles from "./MainLayout.module.css";
import { Sidebar } from "./components/Sidebar";

const { Sider, Content } = Layout;

const menuItems = [
  {
    key: "/",
    icon: <MessageOutlined />,
    label: "Tin nhắn",
  },
  {
    key: "/calls",
    icon: <PhoneOutlined />,
    label: "Cuộc gọi",
  },
  {
    key: "/contacts",
    icon: <ContactsOutlined />,
    label: "Danh bạ",
  },
  {
    key: "/profile",
    icon: <UserOutlined />,
    label: "Hồ sơ",
  },
  {
    key: "/settings",
    icon: <SettingOutlined />,
    label: "Cài đặt",
  },
];

export const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const selectedKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    "/";

  return (
    <Layout className={styles.layout}>
      <Sidebar />
      <Layout className={styles.mainContent}>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};
