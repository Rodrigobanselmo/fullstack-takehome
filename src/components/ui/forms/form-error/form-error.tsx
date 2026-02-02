import React from "react";
import styles from "./form-error.module.css";

interface FormErrorProps {
  error?: string;
}

const FormError: React.FC<FormErrorProps> = ({ error }) => {
  if (!error) return null;
  return <div className={styles.errorMessage}>{error}</div>;
};

export default FormError;
