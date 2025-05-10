import { Button, Form, Input, message, Spin } from "antd";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useInternalError } from "../../../../hooks/useInternalError";
import { AppDispatch, RootState } from "../../../../store";
import * as translator from "../../../../utils/translator";
import { forgotPasswordRequest, resetStatus } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

interface ForgotPasswordForm {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [form] = Form.useForm<ForgotPasswordForm>();
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
        translator.common.success_message(
          t,
          translator.auth.send_validate_code(t)
        )
      );
      dispatch(resetStatus());
      return;
    }
  }, [auth.status, navigate, t, dispatch]);

  const onFinish = async (values: ForgotPasswordForm): Promise<void> => {
    dispatch(forgotPasswordRequest(values.email));
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
          <h1 className={styles.title}>{translator.auth.forgot_password(t)}</h1>
        </div>
        <Form
          form={form}
          name="forgot_password"
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
          <Form.Item className={styles.formItem}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className={styles.button}
            >
              {translator.auth.send_validate_code(t)}
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.footer}>
          <Link to="/login" className={styles.link}>
            {translator.auth.login(t)}
          </Link>
          <span> {translator.common.or(t)} </span>
          <Link to="/register" className={styles.link}>
            {translator.auth.register(t)}
          </Link>
        </div>
      </div>
    </div>
  );
};
