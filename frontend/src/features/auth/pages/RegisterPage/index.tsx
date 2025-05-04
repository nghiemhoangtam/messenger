import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Input, message, Spin } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../../../store";
import { registerRequest, resetStatusAndError } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

interface RegisterForm {
  email: string;
  password: string;
  display_name: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterForm>(); 

  useEffect(() => {
    dispatch(resetStatusAndError());
  }, [dispatch]);
  
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/");
    }
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (auth.error) {
      message.error(auth.error);
    }
  }, [auth.error]);

  useEffect(() => {
    if (auth.status === "succeeded") {
      message.success("Đăng ký thành công");
      navigate("/verify-token");
      return ;
    }
  }, [auth.status, navigate]);

  const onFinish = async (values: RegisterForm): Promise<void> => {
      if (values.password !== values.confirmPassword) {
        message.error("Mật khẩu xác nhận không khớp");
        return;
      }
      dispatch(registerRequest({
        display_name: values.display_name,
        email: values.email,
        password: values.password,
      }));
  };

  const handleSocialRegister = (provider: string): void => {
    // Implement social register logic here
    console.log(`Register with ${provider}`);
  };

    if(auth.status === "loading") {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <Spin size="large" className={styles.loading} />
          </div>
        </div>
      );
    }

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
            name="display_name"
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
