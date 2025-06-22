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
  disabled?: boolean;
  clearable?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  name,
  required = false,
  options,
  placeholder,
  disabled = false,
  clearable = false,
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
      disabled={disabled}
    >
      {placeholder && (
        <option value="" disabled={!clearable}>
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
