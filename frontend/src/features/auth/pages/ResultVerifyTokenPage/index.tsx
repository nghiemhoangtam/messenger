import { Spin } from "antd";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../../../store";
import * as translator from "../../../../utils/translator";
import { verifyTokenRequest } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

export const ResultVerifyTokenPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      navigate("/register");
    } else {
      dispatch(verifyTokenRequest(token));
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    if (auth.status === "succeeded") {
      const timeout = setTimeout(() => {
        navigate("/login");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [auth.status, navigate]);

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
            <h1 className={styles.title}>
              {translator.common.result_of(
                t,
                translator.common.confirmation(t)
              )}
            </h1>
            <img
              src="/assets/images/fail.svg"
              alt="Messenger Logo"
              className={styles.logo}
            />
            <p>
              {translator.common.fail_message(
                t,
                translator.common.confirmation(t)
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (auth.status === "succeeded") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1 className={styles.title}>
              {translator.common.result_of(
                t,
                translator.common.confirmation(t)
              )}
            </h1>
            <img
              src="/assets/images/success.svg"
              alt="Messenger Logo"
              className={styles.logo}
            />
            <p>
              {translator.common.success_message(
                t,
                translator.common.confirmation(t)
              )}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <div></div>;
};
