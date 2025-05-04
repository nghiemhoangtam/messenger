import { message, Spin } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../../../store";
import { verifyTokenRequest } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

export const ResultVerifyTokenPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      navigate("/register");
    } else {
      dispatch(verifyTokenRequest(token));
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (auth.error) {
      message.error(auth.error);
    }
  }, [auth.error]);

  if (auth.status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Spin size="large" className={styles.loading} />
        </div>
      </div>
    );
  }

  if (auth.status === "failed") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Kết quả xác thực</h1>
            <img
              src="/assets/images/fail.svg"
              alt="Messenger Logo"
              className={styles.logo}
            />
            <p>Xác thực thất bại</p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.status === "succeeded") {
    setTimeout(() => {
      navigate("/login");
    }, 3000);

    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>Kết quả xác thực</h1>
            <img
              src="/assets/images/success.svg"
              alt="Messenger Logo"
              className={styles.logo}
            />
            <p>Xác thực thành công</p>
          </div>
        </div>
      </div>
    );
  }

  return <div></div>
};
