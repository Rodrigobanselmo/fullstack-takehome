import { type Subtask } from "generated/gql/graphql";
import { useRouter } from "next/navigation";
import Button from "~/components/ui/button/button";
import { paths } from "~/config/paths";
import { useDeleteSubtaskMutation } from "../../api/use-delete-subtask-mutation";
import { useQuerySubtasks } from "../../api/use-query-subtasks";
import SubtasksList from "../subtasks-list/subtasks-list";
import styles from "./subtasks-section.module.css";

interface SubtasksSectionProps {
  jobId: string;
  canEdit?: boolean;
}

export default function SubtasksSection({
  jobId,
  canEdit = false,
}: SubtasksSectionProps) {
  const router = useRouter();
  const { data, loading } = useQuerySubtasks(jobId);
  const [deleteSubtask] = useDeleteSubtaskMutation();

  const subtasks = data?.subtasks || [];

  const handleAddSubtask = () => {
    router.push(paths.dashboard.contractor.jobs.subtasks.add.getHref(jobId));
  };

  const handleEditSubtask = (subtask: Subtask) => {
    router.push(
      paths.dashboard.contractor.jobs.subtasks.edit.getHref(jobId, subtask.id),
    );
  };

  const handleDeleteSubtask = async (subtask: Subtask) => {
    if (!confirm("Are you sure you want to delete this subtask?")) {
      return;
    }

    await deleteSubtask({
      variables: {
        id: subtask.id,
        jobId,
      },
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Subtasks ({subtasks.length})</h2>
        {canEdit && (
          <Button onClick={handleAddSubtask} size="sm" variant="outline">
            Add Subtask
          </Button>
        )}
      </div>

      <SubtasksList
        subtasks={subtasks}
        onEditSubtask={canEdit ? handleEditSubtask : undefined}
        onDeleteSubtask={canEdit ? handleDeleteSubtask : undefined}
        canEdit={canEdit}
        loading={loading}
      />
    </div>
  );
}
