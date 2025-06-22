"use client";

import { useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import Button from "~/components/ui/button/button";
import EmptyState from "~/components/ui/empty-state/empty-state";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import { paths } from "~/config/paths";
import { useQueryContractorJobs } from "~/features/jobs/api/use-query-contractor-jobs";
import JobCard from "~/features/jobs/components/job-card/job-card";
import JobsGrid from "~/features/jobs/components/jobs-grid/jobs-grid";

export default function ContractorDashboardPage() {
  const router = useRouter();
  const { data, loading, error } = useQueryContractorJobs();

  const handleAddJob = () => {
    router.push(paths.dashboard.contractor.jobs.add.getHref());
  };

  const handleJobClick = (jobId: string) => {
    router.push(paths.dashboard.contractor.jobs.edit.getHref(jobId));
  };

  return (
    <ContentLayout
      title="My Jobs"
      actions={<Button onClick={handleAddJob}>+ Add Job</Button>}
    >
      {loading && <LoadingState message="Loading your jobs..." />}

      {error && (
        <ErrorState message="Unable to load jobs. Please try again later." />
      )}

      {data && data.jobs.length === 0 && (
        <EmptyState
          title="No jobs yet"
          message="You haven't added any jobs yet. Add a job to get started."
        />
      )}

      {data && data.jobs.length > 0 && (
        <JobsGrid>
          {data.jobs.map((job) => (
            <JobCard
              key={job.id}
              id={job.id}
              description={job.description}
              location={job.location}
              status={job.status}
              cost={job.cost}
              username={job.homeowner?.username}
              onClick={() => handleJobClick(job.id)}
            />
          ))}
        </JobsGrid>
      )}
    </ContentLayout>
  );
}
