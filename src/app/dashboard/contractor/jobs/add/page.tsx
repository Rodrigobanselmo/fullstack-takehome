"use client";

import { useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import { paths } from "~/config/paths";
import { useCreateJobMutation } from "~/features/jobs/api/use-create-job-mutation";
import JobForm from "~/features/jobs/components/job-form/job-form";
import { type CreateJobFormData } from "~/features/jobs/schemas/create-job-schema";

export default function AddJobPage() {
  const router = useRouter();
  const [createJob, { loading }] = useCreateJobMutation();

  const handleBack = () => {
    router.push(paths.dashboard.contractor.getHref());
  };

  const handleSubmit = async (data: CreateJobFormData) => {
    await createJob({
      variables: {
        input: {
          description: data.description.trim(),
          location: data.location.trim(),
          status: data.status,
          cost: parseFloat(data.cost),
          homeownerId: data.homeownerId || undefined,
        },
      },
      onCompleted: () => {
        router.push(paths.dashboard.contractor.getHref());
      },
    });
  };

  return (
    <ContentLayout title="Add New Job" onBack={handleBack}>
      <JobForm loading={loading} onSubmit={handleSubmit} />
    </ContentLayout>
  );
}
