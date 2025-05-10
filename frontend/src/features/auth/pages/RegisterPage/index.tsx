import {
  FacebookOutlined,
  GithubOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Button, Divider, Form, Input, message, Spin } from "antd";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useInternalError } from "../../../../hooks/useInternalError";
import { AppDispatch, RootState } from "../../../../store";
import * as translator from "../../../../utils/translator";
import { registerRequest } from "../../authSlice";
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
  const { t } = useTranslation();

  useInternalError(auth.error);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/");
    }
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (auth.status === "succeeded") {
      message.success(
        translator.common.success_message(t, translator.auth.login(t))
      );
      navigate("/verify-token");
      return;
    }
  }, [auth.status, navigate, t]);

  const onFinish = async (values: RegisterForm): Promise<void> => {
    if (values.password !== values.confirmPassword) {
      message.error(translator.auth.password_not_match(t));
      return;
    }
    dispatch(
      registerRequest({
        display_name: values.display_name,
        email: values.email,
        password: values.password,
      })
    );
  };

  const handleSocialRegister = (provider: string): void => {
    // Implement social register logic here
    console.log(`Register with ${provider}`);
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
          <h1 className={styles.title}>{translator.auth.register(t)}</h1>
          <p className={styles.subtitle}>{translator.auth.new_account(t)}</p>
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
              {
                required: true,
                message: translator.common.enter_field_message(
                  t,
                  translator.common.display_name(t)
                ),
              },
            ]}
            className={styles.formItem}
          >
            <Input
              placeholder={translator.common.display_name(t)}
              size="large"
              className={styles.input}
            />
          </Form.Item>

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
            <Input placeholder="Email" size="large" className={styles.input} />
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
              {
                min: 6,
                message: translator.common.at_least_letter(
                  t,
                  translator.common.pass(t),
                  6
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

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: translator.common.prompt_field_confirm(
                  t,
                  translator.common.pass(t)
                ),
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(translator.auth.password_not_match(t))
                  );
                },
              }),
            ]}
            className={styles.formItem}
          >
            <Input.Password
              placeholder={translator.common.prompt_field_confirm(
                t,
                translator.common.pass(t)
              )}
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
              {translator.auth.register(t)}
            </Button>
          </Form.Item>
        </Form>

        <Divider className={styles.divider}>{translator.common.or(t)}</Divider>

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
          {translator.auth.do_have_account(t)}
          <Link to="/login" className={styles.link}>
            {translator.auth.login(t)}
          </Link>
        </div>
      </div>
    </div>
  );
};
