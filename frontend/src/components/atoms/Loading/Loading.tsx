import { Spin } from "antd";
import styles from "./Loading.module.css";

const Loading = () => {
  return (
    <div className={styles.container}>
      <Spin size="large" tip="Loading..." />
    </div>
  );
};

export default Loading;
