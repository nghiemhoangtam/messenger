import { Button, Spin } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import CountDown from "../../../../components/molecules/CountDown";
import { AppDispatch, RootState } from "../../../../store";
import {
  resendVerificationRequest,
  resetStatusAndError,
} from "../../authSlice";
import styles from "../../styles/Auth.module.css";

export const VerifyTokenPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(resetStatusAndError());
  }, [dispatch]);

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
          <h1 className={styles.title}>Xác thực tài khoản</h1>
          <p className={styles.subtitle}>Kiểm tra email {auth.user.email}</p>
          <CountDown seconds={60} />
        </div>
        <div className={styles.footer}>
          Bạn chưa nhận email xác thực?
          <Button className={styles.link} onClick={() => handleResendVerification()}>
            Gửi lại
          </Button>
        </div>
      </div>
    </div>
  );
};
