import { Button, Spin } from "antd";
import React from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import CountDown from "../../../../components/molecules/CountDown";
import { useShowError } from "../../../../hooks/useShowError";
import { AppDispatch, RootState } from "../../../../store";
import * as translator from "../../../../utils/translator";
import {
  resendVerificationRequest
} from "../../authSlice";
import { useClearUpError } from "../../hooks/useClearUpError";
import styles from "../../styles/Auth.module.css";

export const VerifyTokenPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  useShowError(auth.error);

  useClearUpError();

  if (auth.isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (!auth.user) {
    return <Navigate to="/register" />;
  }
  const handleResendVerification = () => {
    if (auth.user) {
      dispatch(resendVerificationRequest(auth.user.email));
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
          <h1 className={styles.title}>
            {translator.common.validate_field(t, translator.common.account(t))}
          </h1>
          <p className={styles.subtitle}>
            {translator.common.check_field(t, `email ${auth.user.email}`)}
          </p>
          <CountDown seconds={60} />
        </div>
        <div className={styles.footer}>
          {translator.auth.have_not_receive_email(t)}
          <Button
            className={styles.link}
            onClick={() => handleResendVerification()}
          >
            {translator.auth.resend(t)}
          </Button>
        </div>
      </div>
    </div>
  );
};
