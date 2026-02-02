import styles from "./checkbox-field.module.css";

interface CheckboxFieldProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  description?: string;
}

export default function CheckboxField({
  label,
  name,
  checked,
  onChange,
  disabled = false,
  description,
}: CheckboxFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className={styles.container}>
      <div className={styles.checkboxWrapper}>
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          className={styles.checkbox}
        />
        <label
          htmlFor={name}
          className={`${styles.label} ${disabled ? styles.disabled : ""}`}
        >
          {label}
        </label>
      </div>
      {description && <p className={styles.description}>{description}</p>}
    </div>
  );
}

