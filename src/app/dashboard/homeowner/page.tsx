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

export default function HomeownerDashboardPage() {
  const router = useRouter();
  const { data, loading, error } = useQueryHomeownerJobs();

  const handleJobClick = (jobId: string) => {
    router.push(paths.dashboard.homeowner.view.getHref(jobId));
  };

  return (
    <ContentLayout title="My Projects">
      {loading && <LoadingState message="Loading your projects..." />}

      {error && (
        <ErrorState message="Unable to load projects. Please try again later." />
      )}

      {data && data.jobs.length === 0 && (
        <EmptyState
          title="No projects yet"
          message="You haven't added any projects yet."
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
