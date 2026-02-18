import React from "react";
import styles from "./text-field.module.css";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  placeholder?: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
  multiline?: boolean;
  maxLines?: number;
  error?: string;
}

const TextField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  autoComplete,
  required = false,
  multiline = false,
  maxLines,
  error,
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.inputLabel}>
      {label}
      {!required && <span className={styles.optionalLabel}> (optional)</span>}
    </label>
    {multiline ? (
      <textarea
        id={name}
        name={name}
        autoComplete={autoComplete}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={maxLines}
        style={{ resize: "vertical", minHeight: "3rem" }}
      />
    ) : (
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
    {error && <span className={styles.errorMessage}>{error}</span>}
  </div>
);

export default TextField;
