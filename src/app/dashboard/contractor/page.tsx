"use client";

import { gql, useQuery } from "@apollo/client";
import styles from "./index.module.css";
import type { JobsQuery } from "generated/gql/graphql";
import JobCard from "~/components/features/jobs/components/job-card/job-card";
import LoadingState from "~/components/ui/loading-state/loading-state";
import ErrorState from "~/components/ui/error-state/error-state";
import EmptyState from "~/components/ui/empty-state/empty-state";
import PageHeader from "~/components/ui/page-header/page-header";

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
  const { data, loading, error } = useQuery<JobsQuery>(JOBS_QUERY);

  return (
    <div className={styles.main}>
      <PageHeader title="My Jobs" />

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
        <div className={styles.jobsGrid}>
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
        </div>
      )}
    </div>
  );
}
