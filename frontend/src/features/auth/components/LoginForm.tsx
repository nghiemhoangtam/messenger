import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, message } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store";
import { loginRequest } from "../../../store/slices/authSlice";
import styles from "./LoginForm.module.css";

interface LoginFormData {
  email: string;
  password: string;
}

export const LoginForm: React.FC = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const onFinish = (values: LoginFormData) => {
    dispatch(loginRequest(values));
  };

  React.useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  return (
    <div className={styles.loginContainer}>
      <Card title="Đăng nhập" className={styles.loginCard}>
        <Form name="login" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
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
      </Card>
    </div>
  );
};
