import {
  FacebookOutlined,
  GoogleOutlined,
  LockOutlined,
  MailOutlined,
  TwitterOutlined,
} from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthProvider, LoginCredentials } from "../../types";
import styles from "./LoginForm.module.css";

export const LoginForm: React.FC = () => {
  const { login, socialAuth, loading, error } = useAuth();

  const handleSubmit = (values: LoginCredentials) => {
    login(values);
  };

  const handleSocialAuth = (provider: AuthProvider) => {
    // Trong thực tế, bạn sẽ cần tích hợp SDK của từng nền tảng
    // và lấy token từ quá trình xác thực của họ
    socialAuth({ provider, token: "dummy-token" });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Đăng nhập</h1>
      {error && <Alert message={error} type="error" className={styles.alert} />}
      <Form
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        className={styles.form}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email" },
            { type: "email", message: "Email không hợp lệ" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            size="large"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            size="large"
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.divider}>
        <span>Hoặc đăng nhập bằng</span>
      </div>

      <div className={styles.socialButtons}>
        <Button
          icon={<GoogleOutlined />}
          onClick={() => handleSocialAuth("google")}
          size="large"
          className={styles.googleButton}
        >
          Google
        </Button>
        <Button
          icon={<FacebookOutlined />}
          onClick={() => handleSocialAuth("facebook")}
          size="large"
          className={styles.facebookButton}
        >
          Facebook
        </Button>
        <Button
          icon={<TwitterOutlined />}
          onClick={() => handleSocialAuth("twitter")}
          size="large"
          className={styles.twitterButton}
        >
          Twitter
        </Button>
      </div>

      <div className={styles.footer}>
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </div>
    </div>
  );
};
