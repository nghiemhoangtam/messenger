import { Menu } from "antd";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./SettingsPage.module.css";

const settingsSections = [
  { key: "general", label: "Cài đặt chung" },
  { key: "notifications", label: "Thông báo" },
  { key: "privacy", label: "Quyền riêng tư" },
  { key: "security", label: "Bảo mật" },
  { key: "appearance", label: "Giao diện" },
];

export const SettingsPage: React.FC = () => {
  const { section } = useParams();
  const navigate = useNavigate();

  const handleMenuClick = (key: string) => {
    navigate(`/settings/${key}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <Menu
          mode="inline"
          selectedKeys={[section || "general"]}
          items={settingsSections.map((item) => ({
            key: item.key,
            label: item.label,
            onClick: () => handleMenuClick(item.key),
          }))}
        />
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>
            {
              settingsSections.find((s) => s.key === (section || "general"))
                ?.label
            }
          </h1>
        </div>
        <div className={styles.settingsContent}>
          Nội dung cài đặt cho {section || "general"}
        </div>
      </div>
    </div>
  );
};
