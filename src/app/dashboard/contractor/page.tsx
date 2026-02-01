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
import JobStatusFilter from "~/features/jobs/components/job-status-filter/job-status-filter";
import { useJobStatusFilter } from "~/features/jobs/hooks/use-job-status-filter";
import type { JobStatus } from "generated/gql/graphql";

export default function ContractorDashboardPage() {
  const router = useRouter();
  const { selectedStatus, updateStatus } = useJobStatusFilter();
  const { data, loading, error } = useQueryContractorJobs(selectedStatus);

  const handleAddJob = () => {
    router.push(paths.dashboard.contractor.jobs.add.getHref());
  };

  const handleJobClick = (jobId: string) => {
    router.push(paths.dashboard.contractor.jobs.view.getHref(jobId));
  };

  const handleStatusChange = (status: JobStatus | null) => {
    updateStatus(status);
  };

  return (
    <ContentLayout
      title="My Jobs"
      actions={<Button onClick={handleAddJob}>+ Add Job</Button>}
    >
      <JobStatusFilter
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      {loading && !data && <LoadingState message="Loading your jobs..." />}

      {error && (
        <ErrorState message="Unable to load jobs. Please try again later." />
      )}

      {data?.jobs.length === 0 && (
        <EmptyState
          title={`No ${selectedStatus.toLowerCase()} jobs`}
          message={`You don't have any ${selectedStatus.toLowerCase()} jobs.`}
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
              name={job.homeowner.name}
              onClick={() => handleJobClick(job.id)}
            />
          ))}
        </JobsGrid>
      )}
    </ContentLayout>
  );
}
