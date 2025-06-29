"use client";

import { useParams, useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import { paths } from "~/config/paths";
import { useCreateSubtaskMutation } from "~/features/subtasks/api/use-create-subtask-mutation";
import SubtaskForm from "~/features/subtasks/components/subtask-form/subtask-form";
import { type CreateSubtaskFormData } from "~/features/subtasks/schemas/create-subtask-schema";

export default function AddSubtaskPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [createSubtask, { loading }] = useCreateSubtaskMutation();

  const handleCancel = () => {
    router.push(paths.dashboard.contractor.jobs.view.getHref(jobId));
  };

  const handleSubmit = async (data: CreateSubtaskFormData) => {
    await createSubtask({
      variables: {
        input: {
          description: data.description,
          cost: data.cost,
          deadline: data.deadline,
          status: data.status,
          jobId,
        },
      },
      onCompleted: () => {
        router.push(paths.dashboard.contractor.jobs.view.getHref(jobId));
      },
    });
  };

  return (
    <ContentLayout maxWidth="600px" title="Add New Subtask">
      <SubtaskForm
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitButtonText="Create Subtask"
        loadingText="Creating Subtask..."
      />
    </ContentLayout>
  );
}
