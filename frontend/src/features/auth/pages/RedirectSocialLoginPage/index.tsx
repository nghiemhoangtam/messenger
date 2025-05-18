import { Spin } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useShowError } from "../../../../hooks/useShowError";
import { RootState } from "../../../../store";
import { getUserInfoRequest } from "../../authSlice";
import styles from "../../styles/Auth.module.css";

export const RedirectSocialLoginPage: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useShowError(auth.error);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");
    if (!accessToken || !refreshToken) {
      navigate("/login");
      return;
    } else {
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      dispatch(getUserInfoRequest());
    }
  }, [navigate, dispatch]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate("/");
    }
  }, [auth.isAuthenticated, navigate]);

  if (auth.status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <Spin size="large" className={styles.loading} />
        </div>
      </div>
    );
  }

  return <div></div>;
};
