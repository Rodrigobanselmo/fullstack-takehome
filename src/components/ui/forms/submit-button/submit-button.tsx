import React from "react";
import styles from "./submit-button.module.css";

interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  children,
  isLoading = false,
  disabled = false,
}) => (
  <button
    type="submit"
    disabled={isLoading || disabled}
    className={styles.submitButton}
  >
    {isLoading ? "Signing in..." : children}
  </button>
);

export default SubmitButton; 