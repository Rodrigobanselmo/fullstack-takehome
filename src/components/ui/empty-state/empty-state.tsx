import React from "react";
import styles from "./empty-state.module.css";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No items found",
  message = "There are no items to display at the moment.",
}) => {
  return (
    <div className={styles.emptyState}>
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
};

export default EmptyState;
