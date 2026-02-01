"use client";

import { useRouter } from "next/navigation";
import ContentLayout from "~/components/layouts/content-layout/content-layout";
import EmptyState from "~/components/ui/empty-state/empty-state";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import { paths } from "~/config/paths";
import { useQueryHomeownerJobs } from "~/features/jobs/api/use-query-homeowner-jobs";
import JobCard from "~/features/jobs/components/job-card/job-card";
import JobsGrid from "~/features/jobs/components/jobs-grid/jobs-grid";
import JobStatusFilter from "~/features/jobs/components/job-status-filter/job-status-filter";
import { useJobStatusFilter } from "~/features/jobs/hooks/use-job-status-filter";
import type { JobStatus } from "generated/gql/graphql";

export default function HomeownerDashboardPage() {
  const router = useRouter();
  const { selectedStatus, updateStatus } = useJobStatusFilter();
  const { data, loading, error } = useQueryHomeownerJobs(selectedStatus);

  const handleJobClick = (jobId: string) => {
    router.push(paths.dashboard.homeowner.view.getHref(jobId));
  };

  const handleStatusChange = (status: JobStatus | null) => {
    updateStatus(status);
  };

  return (
    <ContentLayout title="My Projects">
      <JobStatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {loading && <LoadingState message="Loading your projects..." />}

      {error && (
        <ErrorState message="Unable to load projects. Please try again later." />
      )}

      {data?.jobs.length === 0 && (
        <EmptyState
          title={`No ${selectedStatus.toLowerCase()} projects`}
          message={`You don't have any ${selectedStatus.toLowerCase()} projects.`}
        />
      )}

      {data && data.jobs.length > 0 && (
        <JobsGrid>
          {data.jobs.map((job) => (
            <JobCard
              key={job.id}
              description={job.description}
              location={job.location}
              status={job.status}
              cost={job.cost}
              name={job.contractor.name}
              onClick={() => handleJobClick(job.id)}
            />
          ))}
        </JobsGrid>
      )}
    </ContentLayout>
  );
}
