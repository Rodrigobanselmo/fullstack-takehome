import type { JobsQuery } from "generated/gql/graphql";
import styles from "./jobs-grid.module.css";

interface JobsGridProps {
  children: React.ReactNode;
}

export default function JobsGrid({ children }: JobsGridProps) {
  return <div className={styles.jobsGrid}>{children}</div>;
}
