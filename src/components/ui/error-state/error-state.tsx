import React from "react";
import styles from "./error-state.module.css";

interface ErrorStateProps {
  message?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  message = "Something went wrong. Please try again.",
}) => {
  return <div className={styles.errorState}>{message}</div>;
};

export default ErrorState;
