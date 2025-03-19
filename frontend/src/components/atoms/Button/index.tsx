import { Button as AntButton } from "antd";
import { ButtonProps } from "antd/lib/button";
import React from "react";
import styles from "./Button.module.css";

interface CustomButtonProps extends ButtonProps {
  customVariant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<CustomButtonProps> = ({
  customVariant = "primary",
  className,
  children,
  ...props
}) => {
  return (
    <AntButton
      className={`${styles.button} ${styles[customVariant]} ${className || ""}`}
      {...props}
    >
      {children}
    </AntButton>
  );
};
