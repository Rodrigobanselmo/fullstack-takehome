"use client";

import { useParams, useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import { paths } from "~/config/paths";
import { useQueryHomeownerJob } from "~/features/jobs/api/use-query-homeowner-job";
import JobView from "~/features/jobs/components/job-view/job-view";

export default function ViewProjectPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const { data, loading: loadingJob, error } = useQueryHomeownerJob(jobId);

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
      <ContentLayout
        maxWidth="600px"
        title="Project Details"
        onBack={handleBack}
      >
        <ErrorState message="Project not found or you don't have permission to view it." />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Project Details" maxWidth="600px" onBack={handleBack}>
      <JobView
        description={data.job.description}
        location={data.job.location}
        status={data.job.status}
        cost={data.job.cost}
        name={data.job.contractor.name}
        onChat={() =>
          router.push(paths.dashboard.chat.user.getHref(data.job.contractor.id))
        }
      />
    </ContentLayout>
  );
}
