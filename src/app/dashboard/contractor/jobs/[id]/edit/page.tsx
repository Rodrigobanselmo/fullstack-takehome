"use client";

import { useParams, useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import Button from "~/components/ui/button/button";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import { paths } from "~/config/paths";
import { useQueryJob } from "~/features/jobs/api/use-query-job";
import { useUpdateJobMutation } from "~/features/jobs/api/use-update-job-mutation";
import { useDeleteJobMutation } from "~/features/jobs/api/use-delete-job-mutation";
import JobForm from "~/features/jobs/components/job-form/job-form";
import { type CreateJobFormData } from "~/features/jobs/schemas/create-job-schema";

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data, loading: loadingJob, error } = useQueryJob(jobId);
  const [updateJob, { loading: updating }] = useUpdateJobMutation();
  const [deleteJob, { loading: deleting }] = useDeleteJobMutation();

  const handleBack = () => {
    router.push(paths.dashboard.contractor.getHref());
  };

  const handleSubmit = async (formData: CreateJobFormData) => {
    await updateJob({
      variables: {
        id: jobId,
        input: {
          description: formData.description.trim(),
          location: formData.location.trim(),
          status: formData.status,
          cost: parseFloat(formData.cost),
          homeownerId: formData.homeownerId,
        },
      },
      onCompleted: () => {
        router.push(paths.dashboard.contractor.getHref());
      },
    });
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    ) {
      return;
    }

    await deleteJob({
      variables: { id: jobId },
      onCompleted: () => {
        router.push(paths.dashboard.contractor.getHref());
      },
    });
  };

  if (loadingJob) {
    return (
      <ContentLayout maxWidth="600px" title="Edit Job" onBack={handleBack}>
        <LoadingState message="Loading job details..." />
      </ContentLayout>
    );
  }

  if (error || !data?.job) {
    return (
      <ContentLayout maxWidth="600px" title="Edit Job" onBack={handleBack}>
        <ErrorState message="Job not found or you don't have permission to edit it." />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout
      title={`Edit Job`}
      maxWidth="600px"
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
      <JobForm
        initialData={{
          description: data.job.description,
          location: data.job.location,
          status: data.job.status,
          cost: data.job.cost.toString(),
          homeownerId: data.job.homeowner.id,
        }}
        loading={updating}
        onSubmit={handleSubmit}
        onCancel={handleBack}
        submitButtonText="Save"
        loadingText="Editing Job..."
      />
    </ContentLayout>
  );
}
