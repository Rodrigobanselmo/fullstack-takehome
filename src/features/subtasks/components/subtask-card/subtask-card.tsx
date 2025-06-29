import { type Subtask } from "generated/gql/graphql";
import { formatDateForDisplay } from "~/lib/date";
import styles from "./subtask-card.module.css";
import { formatCurrency } from "~/lib/currency";
import { SUBTASK_STATUS_MAP } from "../../constants/subtask-status-map";

interface SubtaskCardProps {
  subtask: Subtask;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
}

export const SUBTASK_STATUS_COLORS: Record<string, string | undefined> = {
  PENDING: styles.pending,
  IN_PROGRESS: styles.inProgress,
  COMPLETED: styles.completed,
  CANCELED: styles.canceled,
} as const;

export default function SubtaskCard({
  subtask,
  onEdit,
  canEdit = false,
}: SubtaskCardProps) {
  const formatDate = (date?: Date | null) => {
    if (!date) return "No deadline";
    return formatDateForDisplay(date);
  };

  const handleCardClick = () => {
    if (canEdit && onEdit) {
      onEdit();
    }
  };

  return (
    <div
      className={`${styles.card} ${canEdit ? styles.clickable : ""}`}
      onClick={handleCardClick}
    >
      <div className={styles.header}>
        <h3 className={styles.title}>{subtask.description}</h3>
        <span
          className={`${styles.status} ${SUBTASK_STATUS_COLORS[subtask.status]}`}
        >
          {SUBTASK_STATUS_MAP[subtask.status]}
        </span>
      </div>

      <div className={styles.details}>
        <div className={styles.detail}>
          <span className={styles.label}>Cost:</span>
          <span className={styles.value}>${formatCurrency(subtask.cost)}</span>
        </div>
        <div className={styles.detail}>
          <span className={styles.label}>Deadline:</span>
          <span className={styles.value}>{formatDate(subtask.deadline)}</span>
        </div>
      </div>
    </div>
  );
}
