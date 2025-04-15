import { Progress } from "antd";
import React, { useEffect, useRef, useState } from "react";
import styles from "./CountDown.module.css";

interface CountDownProps {
  seconds: number;
}

const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds >= 3600) {
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  } else if (totalSeconds >= 60) {
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${seconds.toString()}s`;
  }
};

const CountDown: React.FC<CountDownProps> = ({ seconds }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const percentage = (timeLeft / seconds) * 100;

  return (
    <div className={styles.container}>
      <Progress
        type="circle"
        percent={percentage}
        format={() => formatTime(timeLeft)}
        strokeColor={{ "0%": "#108ee9", "100%": "#87d068" }}
      />
    </div>
  );
};

export default CountDown;
