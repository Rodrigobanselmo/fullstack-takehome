import { Trash2, AlertTriangle, Info } from "lucide-react";
import Button from "../button/button";
import styles from "./modal.module.css";

type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const variantIcons: Record<ConfirmVariant, React.ReactNode> = {
  danger: <Trash2 size={28} />,
  warning: <AlertTriangle size={28} />,
  info: <Info size={28} />,
};

const variantIconStyles: Record<ConfirmVariant, string> = {
  danger: styles.confirmIconDanger || "",
  warning: styles.confirmIconWarning || "",
  info: styles.confirmIconInfo || "",
};

const variantButtonColors: Record<
  ConfirmVariant,
  "danger" | "secondary" | "primary"
> = {
  danger: "danger",
  warning: "secondary",
  info: "primary",
};

export function ConfirmDialog({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <div
      className={`${styles.dialog} ${styles.confirmDialog}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.dialogBody}>
        <div className={`${styles.confirmIcon} ${variantIconStyles[variant]}`}>
          {variantIcons[variant]}
        </div>
        <h2 className={styles.confirmTitle}>{title}</h2>
        <p className={styles.confirmMessage}>{message}</p>
        <div className={styles.confirmActions}>
          <Button
            variant="outline"
            color="grey"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            variant="fill"
            color={variantButtonColors[variant]}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? "Loading..." : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
