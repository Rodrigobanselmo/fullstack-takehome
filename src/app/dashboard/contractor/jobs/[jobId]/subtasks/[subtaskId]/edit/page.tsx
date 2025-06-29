"use client";

import { useParams, useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import Button from "~/components/ui/button/button";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import { paths } from "~/config/paths";
import { useQuerySubtask } from "~/features/subtasks/api/use-query-subtask";
import { useUpdateSubtaskMutation } from "~/features/subtasks/api/use-update-subtask-mutation";
import { useDeleteSubtaskMutation } from "~/features/subtasks/api/use-delete-subtask-mutation";
import SubtaskForm from "~/features/subtasks/components/subtask-form/subtask-form";
import { type CreateSubtaskFormData } from "~/features/subtasks/schemas/create-subtask-schema";

export default function EditSubtaskPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const subtaskId = params.subtaskId as string;

  const { data, loading: loadingSubtask } = useQuerySubtask(subtaskId, jobId);
  const [updateSubtask, { loading: updating }] = useUpdateSubtaskMutation();
  const [deleteSubtask, { loading: deleting }] = useDeleteSubtaskMutation();

  const subtask = data?.subtask;

  const handleBack = () => {
    router.push(paths.dashboard.contractor.jobs.view.getHref(jobId));
  };

  const handleSubmit = async (formData: CreateSubtaskFormData) => {
    await updateSubtask({
      variables: {
        id: subtaskId,
        jobId,
        input: {
          description: formData.description,
          cost: formData.cost,
          deadline: formData.deadline || null,
          status: formData.status,
        },
      },
      onCompleted: () => {
        router.push(paths.dashboard.contractor.jobs.view.getHref(jobId));
      },
    });
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this subtask? This action cannot be undone.",
      )
    ) {
      return;
    }

    await deleteSubtask({
      variables: { id: subtaskId, jobId },
      onCompleted: () => {
        router.push(paths.dashboard.contractor.jobs.view.getHref(jobId));
      },
    });
  };

  if (loadingSubtask) {
    return (
      <ContentLayout maxWidth="600px" title="Edit Subtask" onBack={handleBack}>
        <LoadingState message="Loading subtask details..." />
      </ContentLayout>
    );
  }

  if (!subtask) {
    return (
      <ContentLayout maxWidth="600px" title="Edit Subtask" onBack={handleBack}>
        <ErrorState message="Subtask not found or you don't have permission to edit it." />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title="Edit Subtask"
      maxWidth="600px"
      onBack={handleBack}
      actions={
        <Button
          color="danger"
          variant="outline"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      }
    >
      <SubtaskForm
        subtask={subtask}
        loading={updating}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText="Save"
        loadingText="Saving Subtask..."
      />
    </ContentLayout>
  );
}
