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
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.inputLabel}>
      {label}
    </label>
    {multiline ? (
      <textarea
        id={name}
        name={name}
        autoComplete={autoComplete}
        required={required}
        className={styles.input}
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
        required={required}
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

export default TextField;
