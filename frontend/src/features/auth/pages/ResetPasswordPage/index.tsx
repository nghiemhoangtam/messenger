import { Button, Form, Input, message, Spin } from "antd";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useShowError } from "../../../../hooks/useShowError";
import { AppDispatch, RootState } from "../../../../store";
import * as translator from "../../../../utils/translator";
import { resetPasswordRequest, resetStatus } from "../../authSlice";
import { useClearUpError } from "../../hooks/useClearUpError";
import styles from "../../styles/Auth.module.css";
interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ResetPasswordForm>();
  const { t } = useTranslation();

  useShowError(auth.error);

  useClearUpError();

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/");
    }
  }, [auth.isAuthenticated, navigate]);

  useEffect(() => {
    if (auth.status === "succeeded") {
      message.success(
        translator.common.success_message(
          t,
          translator.auth.setup_new_password(t)
        )
      );
      dispatch(resetStatus());
      navigate("/login");
      return;
    }
  }, [auth.status, navigate, t, dispatch]);

  const onFinish = async (values: ResetPasswordForm): Promise<void> => {
    if (values.password !== values.confirmPassword) {
      message.error(translator.auth.password_not_match(t));
      return;
    }
    const token = new URLSearchParams(window.location.search).get("token");
    if (token) {
      dispatch(
        resetPasswordRequest({
          password: values.password,
          token,
        })
      );
    } else {
      message.error(translator.common.invalid_field_message(t, "Token"));
    }
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
          <h1 className={styles.title}>{translator.auth.new_password(t)}</h1>
        </div>

        <Form
          form={form}
          name="reset_password"
          onFinish={onFinish}
          className={styles.form}
        >
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: translator.common.enter_field_message(
                  t,
                  translator.auth.new_password(t)
                ),
              },
              {
                min: 6,
                message: translator.common.at_least_letter(
                  t,
                  translator.auth.new_password(t),
                  6
                ),
              },
            ]}
            className={styles.formItem}
          >
            <Input.Password
              placeholder={translator.auth.new_password(t)}
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
                  translator.auth.new_password(t)
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
                translator.auth.new_password(t)
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
              {translator.auth.setup_new_password(t)}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};
