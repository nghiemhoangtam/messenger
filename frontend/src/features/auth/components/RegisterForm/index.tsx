import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input } from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { RegisterCredentials } from "../../types";
import styles from "./RegisterForm.module.css";

export const RegisterForm: React.FC = () => {
  const { register, loading, error } = useAuth();

  const handleSubmit = (values: RegisterCredentials) => {
    register(values);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Đăng ký</h1>
      {error && <Alert message={error} type="error" className={styles.alert} />}
      <Form
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        className={styles.form}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tên người dùng" }]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Tên người dùng"
            size="large"
          />
        </Form.Item>

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
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu" },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Mật khẩu không khớp"));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Xác nhận mật khẩu"
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
            Đăng ký
          </Button>
        </Form.Item>
      </Form>

      <div className={styles.footer}>
        Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
      </div>
    </div>
  );
};
