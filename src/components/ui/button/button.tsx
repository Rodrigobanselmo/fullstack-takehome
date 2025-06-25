import { type ButtonHTMLAttributes } from "react";
import styles from "./button.module.css";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "fill" | "outline" | "ghost";
  color?: "primary" | "secondary" | "grey" | "danger";
  size?: "sm" | "md" | "lg";
  minWidth?: string;
}

export default function Button({
  children,
  variant = "fill",
  color = "primary",
  size = "md",
  className = "",
  minWidth = "auto",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[color]} ${styles[size]} ${className}`}
      style={{ minWidth }}
      {...props}
    >
      {children}
    </button>
  );
}
