import { type Subtask } from "generated/gql/graphql";
import SubtaskCard from "../subtask-card/subtask-card";
import styles from "./subtasks-list.module.css";
import LoadingState from "~/components/ui/loading-state/loading-state";
import EmptyState from "~/components/ui/empty-state/empty-state";

interface SubtasksListProps {
  subtasks: Subtask[];
  onEditSubtask?: (subtask: Subtask) => void;
  onDeleteSubtask?: (subtask: Subtask) => void;
  canEdit?: boolean;
  loading?: boolean;
}

export default function SubtasksList({
  subtasks,
  onEditSubtask,
  onDeleteSubtask,
  canEdit = false,
  loading = false,
}: SubtasksListProps) {
  if (loading) {
    return (
      <div className={styles.container}>
        <LoadingState message="Loading subtasks..." />
      </div>
    );
  }

  if (subtasks.length === 0) {
    return (
      <div className={styles.container}>
        <EmptyState
          title="No subtasks found for this job."
          message="Add subtasks to break down the work into smaller tasks."
        />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {subtasks.map((subtask) => (
          <SubtaskCard
            key={subtask.id}
            subtask={subtask}
            onEdit={onEditSubtask ? () => onEditSubtask(subtask) : undefined}
            onDelete={
              onDeleteSubtask ? () => onDeleteSubtask(subtask) : undefined
            }
            canEdit={canEdit}
          />
        ))}
      </div>
    </div>
  );
}
