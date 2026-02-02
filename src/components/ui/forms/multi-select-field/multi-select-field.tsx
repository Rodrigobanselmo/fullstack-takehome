import { useState, useRef, useEffect } from "react";
import Button from "~/components/ui/button/button";
import styles from "./multi-select-field.module.css";

interface MultiSelectFieldProps {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  name: string;
  required?: boolean;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
}

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  value,
  onChange,
  name,
  required = false,
  options,
  placeholder = "Select...",
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !value.includes(option.value),
  );

  const selectedOptions = options.filter((option) =>
    value.includes(option.value),
  );

  const handleSelect = (optionValue: string) => {
    onChange([...value, optionValue]);
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const lastValue = value[value.length - 1];
    if (e.key === "Backspace" && searchQuery === "" && lastValue) {
      handleRemove(lastValue);
    }
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchQuery("");
    }
    const firstOption = filteredOptions[0];
    if (e.key === "Enter" && firstOption) {
      e.preventDefault();
      handleSelect(firstOption.value);
    }
  };

  return (
    <div className={styles.inputGroup} ref={containerRef}>
      <label htmlFor={name} className={styles.inputLabel}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      <div
        className={`${styles.selectContainer} ${isOpen ? styles.focused : ""} ${disabled ? styles.disabled : ""}`}
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
      >
        <div className={styles.selectedTags}>
          {selectedOptions.map((option) => (
            <span key={option.value} className={styles.tag}>
              {option.label}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={styles.tagRemove}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option.value);
                }}
                disabled={disabled}
              >
                ×
              </Button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={name}
            type="text"
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
          />
        </div>
        <div className={styles.chevron}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6,9 12,15 18,9" />
          </svg>
        </div>
      </div>
      {isOpen && filteredOptions.length > 0 && (
        <div className={styles.dropdown}>
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={styles.dropdownItem}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
      {isOpen && filteredOptions.length === 0 && searchQuery && (
        <div className={styles.dropdown}>
          <div className={styles.noResults}>No results found</div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectField;

