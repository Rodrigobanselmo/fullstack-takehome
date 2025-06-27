import Button from "~/components/ui/button/button";
import styles from "./form-actions.module.css";

export interface FormAction {
  text: string;
  onClick: () => void;
  color?: "primary" | "danger" | "grey";
  variant?: "fill" | "outline";
  size?: "sm" | "md" | "lg";
  minWidth?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export interface FormActionsProps {
  primaryAction?: Omit<FormAction, "onClick">;
  secondaryAction?: FormAction;
  className?: string;
}

export default function FormActions({
  primaryAction,
  secondaryAction,
  className,
}: FormActionsProps) {
  return (
    <div className={`${styles.formActions} ${className || ""}`}>
      {secondaryAction && (
        <Button
          variant={secondaryAction.variant || "outline"}
          color={secondaryAction.color || "grey"}
          size={secondaryAction.size || "lg"}
          onClick={secondaryAction.onClick}
          minWidth={secondaryAction.minWidth || "150px"}
          disabled={secondaryAction.disabled}
        >
          {secondaryAction.loading && secondaryAction.loadingText
            ? secondaryAction.loadingText
            : secondaryAction.text}
        </Button>
      )}
      {primaryAction && (
        <Button
          variant={primaryAction.variant || "fill"}
          color={primaryAction.color || "primary"}
          size={primaryAction.size || "lg"}
          type="submit"
          minWidth={primaryAction.minWidth || "150px"}
          disabled={primaryAction.disabled}
        >
          {primaryAction.loading && primaryAction.loadingText
            ? primaryAction.loadingText
            : primaryAction.text}
        </Button>
      )}
    </div>
  );
}
