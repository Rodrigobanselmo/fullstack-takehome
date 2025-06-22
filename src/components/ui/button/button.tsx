import { type ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "fill" | "outline";
  color?: "primary" | "grey";
  size?: "sm" | "md" | "lg";
}

export default function Button({
  children,
  variant = "fill",
  color = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[color]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
