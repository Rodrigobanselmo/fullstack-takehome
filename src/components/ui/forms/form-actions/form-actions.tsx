import Button, { type ButtonProps } from "~/components/ui/button/button";
import styles from "./form-actions.module.css";

export interface FormAction extends ButtonProps {
  text: string;
  loading?: boolean;
  loadingText?: string;
}

export interface FormActionsProps {
  primaryAction?: FormAction;
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
          {...secondaryAction}
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
          {...primaryAction}
          variant={primaryAction.variant || "fill"}
          color={primaryAction.color || "primary"}
          size={primaryAction.size || "lg"}
          onClick={primaryAction.onClick}
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
