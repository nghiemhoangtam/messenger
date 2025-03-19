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
import { registerRequest } from "../../../../store/slices/authSlice";
import styles from "../../styles/Auth.module.css";

interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterForm>();

  const onFinish = async (values: RegisterForm): Promise<void> => {
    try {
      if (values.password !== values.confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp");
        return;
      }
      await dispatch(registerRequest(values));
      message.success("Đăng ký thành công");
      navigate("/login");
    } catch (error) {
      message.error("Đăng ký thất bại");
    }
  };

  const handleSocialRegister = (provider: string): void => {
    // Implement social register logic here
    console.log(`Register with ${provider}`);
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
          <h1 className={styles.title}>Đăng ký</h1>
          <p className={styles.subtitle}>Tạo tài khoản mới</p>
        </div>

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng" },
            ]}
            className={styles.formItem}
          >
            <Input
              placeholder="Tên người dùng"
              size="large"
              className={styles.input}
            />
          </Form.Item>

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
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
            ]}
            className={styles.formItem}
          >
            <Input.Password
              placeholder="Mật khẩu"
              size="large"
              className={styles.input}
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
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp")
                  );
                },
              }),
            ]}
            className={styles.formItem}
          >
            <Input.Password
              placeholder="Xác nhận mật khẩu"
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>Hoặc</Divider>

        <div className={styles.socialLogin}>
          <Button
            icon={<GoogleOutlined />}
            className={styles.socialButton}
            onClick={() => handleSocialRegister("google")}
          />
          <Button
            icon={<FacebookOutlined />}
            className={styles.socialButton}
            onClick={() => handleSocialRegister("facebook")}
          />
          <Button
            icon={<GithubOutlined />}
            className={styles.socialButton}
            onClick={() => handleSocialRegister("github")}
          />
        </div>

        <div className={styles.footer}>
          Đã có tài khoản?
          <Link to="/login" className={styles.link}>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
