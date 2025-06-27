import React from "react";
import styles from "./loading-state.module.css";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
}) => {
  return <div className={styles.loadingState}>{message}</div>;
};

export default LoadingState;
