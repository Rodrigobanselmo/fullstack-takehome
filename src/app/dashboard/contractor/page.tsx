"use client";

import { gql, useQuery } from "@apollo/client";
import type { JobsQuery } from "generated/gql/graphql";
import { useRouter } from "next/navigation";
import JobCard from "~/components/features/jobs/components/job-card/job-card";
import JobsGrid from "~/components/features/jobs/components/jobs-grid/jobs-grid";
import Button from "~/components/ui/button/button";
import EmptyState from "~/components/ui/empty-state/empty-state";
import ErrorState from "~/components/ui/error-state/error-state";
import LoadingState from "~/components/ui/loading-state/loading-state";
import PageHeader from "~/components/ui/page-header/page-header";
import { ROUTES } from "~/constants/routes";
import styles from "./page.module.css";

const JOBS_QUERY = gql`
  query Jobs {
    jobs {
      id
      description
      location
      status
      cost
      homeowner {
        username
      }
    }
  }
`;

export default function ContractorDashboardPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery<JobsQuery>(JOBS_QUERY);

  const handleAddJob = () => {
    router.push(ROUTES.DASHBOARD.CONTRACTOR.JOBS.ADD);
  };

  return (
    <div className={styles.main}>
      <PageHeader title="My Jobs">
        <Button onClick={handleAddJob}>+ Add Job</Button>
      </PageHeader>

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
            />
          ))}
        </JobsGrid>
      )}
    </div>
  );
}
