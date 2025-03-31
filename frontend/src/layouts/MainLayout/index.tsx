import { Layout } from "antd";
import React from "react";
import styles from "./MainLayout.module.css";
import { Sidebar } from "./components/Sidebar";

const { Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout className={styles.layout}>
      <Sidebar />
      <Content className={styles.content}>{children}</Content>
    </Layout>
  );
};
