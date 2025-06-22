import React from "react";
import styles from "./input-field.module.css";

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  autoComplete,
  required = false,
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.inputLabel}>
      {label}
    </label>
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
  </div>
);

export default InputField;
