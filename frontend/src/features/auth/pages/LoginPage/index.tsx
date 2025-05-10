import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Divider, Flex, Form, Input, Spin } from "antd";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useInternalError } from "../../../../hooks/useInternalError";
import { AppDispatch, RootState } from "../../../../store";
import * as translator from "../../../../utils/translator";
import { loginRequest } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm<LoginForm>();
  const { t } = useTranslation();

  useInternalError(auth.error);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/");
    }
  }, [auth.isAuthenticated, navigate]);

  const onFinish = async (values: LoginForm): Promise<void> => {
    dispatch(loginRequest(values));
  };

  const handleSocialLogin = (provider: string): void => {
    window.location.href = `${process.env.REACT_APP_BASE_URL}/auth/${provider}?redirect=${window.location.origin}/auth/callback`;
  };
  if (auth.status === "loading") {
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
          <h1 className={styles.title}>{translator.auth.login(t)}</h1>
          <p className={styles.subtitle}>{translator.common.welcome(t)}</p>
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
              {
                required: true,
                message: translator.common.enter_field_message(
                  t,
                  translator.common.email(t)
                ),
              },
              {
                type: "email",
                message: translator.common.invalid_field_message(
                  t,
                  translator.common.email(t)
                ),
              },
            ]}
            className={styles.formItem}
          >
            <Input
              placeholder={translator.common.email(t)}
              size="large"
              className={styles.input}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: translator.common.enter_field_message(
                  t,
                  translator.common.pass(t)
                ),
              },
            ]}
            className={styles.formItem}
          >
            <Input.Password
              placeholder={translator.common.pass(t)}
              size="large"
              className={styles.input}
            />
          </Form.Item>
          <Form.Item>
            <Flex justify="space-between" align="center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{translator.auth.remember_me(t)}</Checkbox>
              </Form.Item>
              <Link to="/forgot-password" className={styles.link}>
                {translator.auth.forgot_password(t)}
              </Link>
            </Flex>
          </Form.Item>
          <Form.Item className={styles.formItem}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.button}
            >
              {translator.auth.login(t)}
            </Button>
          </Form.Item>
        </Form>
        <Divider className={styles.divider}>{translator.common.or(t)}</Divider>

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
          {translator.auth.do_not_have_account(t)}
          <Link to="/register" className={styles.link}>
            {translator.auth.register_now(t)}
          </Link>
        </div>
      </div>
    </div>
  );
};
