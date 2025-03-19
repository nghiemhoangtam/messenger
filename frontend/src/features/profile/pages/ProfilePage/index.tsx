import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../../auth";
import styles from "./ProfilePage.module.css";

export const ProfilePage: React.FC = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  const isOwnProfile = !userId || userId === user?.id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>{isOwnProfile ? "Hồ sơ của tôi" : "Hồ sơ người dùng"}</h1>
      </div>
      <div className={styles.content}>
        {isOwnProfile ? (
          <div className={styles.ownProfile}>
            <div className={styles.profileInfo}>
              <h2>{user?.username}</h2>
              <p>{user?.email}</p>
            </div>
          </div>
        ) : (
          <div className={styles.userProfile}>
            Thông tin người dùng {userId}
          </div>
        )}
      </div>
    </div>
  );
};
