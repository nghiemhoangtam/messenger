import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Input, message } from "antd";
import React from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch } from "../../../../store";
import { loginRequest } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginForm>();

  const onFinish = async (values: LoginForm): Promise<void> => {
    try {
      await dispatch(loginRequest(values));
      message.success("Đăng nhập thành công");
      navigate("/");
    } catch (error) {
      message.error("Đăng nhập thất bại");
    }
  };

  const handleSocialLogin = (provider: string): void => {
    // Implement social login logic here
    console.log(`Login with ${provider}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img
            src="/assets/images/logo.svg"
            alt="Messenger Logo"
            className={styles.logo}
          />
          <h1 className={styles.title}>Đăng nhập</h1>
          <p className={styles.subtitle}>Chào mừng bạn trở lại!</p>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
            className={styles.formItem}
          >
            <Input placeholder="Email" size="large" className={styles.input} />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            className={styles.formItem}
          >
            <Input.Password
              placeholder="Mật khẩu"
              size="large"
              className={styles.input}
            />
          </Form.Item>

          <Form.Item className={styles.formItem}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.button}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>Hoặc</Divider>

        <div className={styles.socialLogin}>
          <Button
            icon={<GoogleOutlined />}
            className={styles.socialButton}
            onClick={() => handleSocialLogin("google")}
          />
          <Button
            icon={<FacebookOutlined />}
            className={styles.socialButton}
            onClick={() => handleSocialLogin("facebook")}
          />
          <Button
            icon={<GithubOutlined />}
            className={styles.socialButton}
            onClick={() => handleSocialLogin("github")}
          />
        </div>

        <div className={styles.footer}>
          Chưa có tài khoản?
          <Link to="/register" className={styles.link}>
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
