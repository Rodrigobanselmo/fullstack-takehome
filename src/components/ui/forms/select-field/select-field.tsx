import React from "react";
import styles from "./select-field.module.css";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  name,
  required = false,
  options,
  placeholder,
}) => (
  <div className={styles.inputGroup}>
    <label htmlFor={name} className={styles.inputLabel}>
      {label}
    </label>
    <select
      id={name}
      name={name}
      required={required}
      className={styles.input}
      value={value}
      onChange={onChange}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
