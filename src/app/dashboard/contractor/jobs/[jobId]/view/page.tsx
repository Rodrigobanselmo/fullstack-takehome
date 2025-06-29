"use client";

import { useParams, useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import { paths } from "~/config/paths";
import { useQueryContractorJob } from "~/features/jobs/api/use-query-contractor-job";
import JobView from "~/features/jobs/components/job-view/job-view";
import SubtasksSection from "~/features/subtasks/components/subtasks-section/subtasks-section";

export default function ViewJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const { data, loading: loadingJob, error } = useQueryContractorJob(jobId);

  const handleBack = () => {
    router.push(paths.dashboard.contractor.getHref());
  };

  if (loadingJob) {
    return (
      <ContentLayout maxWidth="600px" title="Job Details" onBack={handleBack}>
        <LoadingState message="Loading job details..." />
      </ContentLayout>
    );
  }

  if (error || !data?.job) {
    return (
      <ContentLayout maxWidth="600px" title="Job Details" onBack={handleBack}>
        <ErrorState message="Job not found or you don't have permission to view it." />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Job Details" maxWidth="800px" onBack={handleBack}>
      <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
        <JobView
          description={data.job.description}
          location={data.job.location}
          status={data.job.status}
          cost={data.job.cost}
          name={data.job.homeowner.name}
          homeownerId={data.job.homeowner.id}
          contractorId={data.job.contractor.id}
          onEdit={() =>
            router.push(paths.dashboard.contractor.jobs.edit.getHref(jobId))
          }
        />

        <SubtasksSection jobId={jobId} canEdit={true} />
      </div>
    </ContentLayout>
  );
}
