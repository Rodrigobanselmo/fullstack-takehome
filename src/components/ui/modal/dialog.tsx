import { type ReactNode } from "react";
import Button from "../button/button";
import styles from "./modal.module.css";

interface DialogProps {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function Dialog({
  title,
  children,
  footer,
  onClose,
  showCloseButton = true,
}: DialogProps) {
  return (
    <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
      {(title || showCloseButton) && (
        <div className={styles.dialogHeader}>
          {title && <h2 className={styles.dialogTitle}>{title}</h2>}
          {showCloseButton && onClose && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={styles.dialogCloseButton}
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </Button>
          )}
        </div>
      )}
      <div className={styles.dialogBody}>{children}</div>
      {footer && <div className={styles.dialogFooter}>{footer}</div>}
    </div>
  );
}
