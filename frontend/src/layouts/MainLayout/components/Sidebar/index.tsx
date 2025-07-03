import {
  LogoutOutlined,
  MessageOutlined,
  PhoneOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Menu, Tooltip } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../../../features/auth/authSlice";
import { RootState } from "../../../../store";
import styles from "./Sidebar.module.css";

const { Sider } = Layout;

export const Sidebar: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const menuItems = [
    {
      key: "/",
      icon: <MessageOutlined />,
      label: "Tin nhắn",
    },
    {
      key: "/contacts",
      icon: <TeamOutlined />,
      label: "Danh bạ",
    },
    {
      key: "/calls",
      icon: <PhoneOutlined />,
      label: "Cuộc gọi",
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

  const handleMenuClick = (key: string) => {
    if (key === "logout") {
      dispatch(logout());
    } else {
      navigate(key);
    }
  };

  return (
    <Sider className={styles.sidebar} width={80}>
      <div className={styles.logo}>
        <Avatar src={user?.avatar} size={40}>
          {user?.display_name}
        </Avatar>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={({ key }) => handleMenuClick(key)}
        className={styles.menu}
      />
      <div className={styles.bottomMenu}>
        <Tooltip title="Đăng xuất" placement="right">
          <div
            className={styles.logoutButton}
            onClick={() => handleMenuClick("logout")}
          >
            <LogoutOutlined />
          </div>
        </Tooltip>
      </div>
    </Sider>
  );
};
