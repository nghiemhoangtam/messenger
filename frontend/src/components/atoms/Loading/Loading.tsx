import { Spin } from "antd";
import styles from "./Loading.module.css";

interface LoadingProps {
  local?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ local = false }) => {
  if (local) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Spin size="large" tip="Loading..." fullscreen />
    </div>
  );
};

export default Loading;
