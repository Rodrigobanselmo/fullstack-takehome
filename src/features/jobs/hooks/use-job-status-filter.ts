"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { JobStatus } from "generated/gql/graphql";

const STATUS_PARAM = "status";
const DEFAULT_STATUS: JobStatus = JobStatus.Planning;

export function useJobStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedStatus = useMemo(() => {
    const statusParam = searchParams.get(STATUS_PARAM);
    if (statusParam && isValidJobStatus(statusParam)) {
      return statusParam;
    }
    return DEFAULT_STATUS;
  }, [searchParams]);

  const updateStatus = useCallback(
    (status: JobStatus | null) => {
      const params = new URLSearchParams(searchParams);

      if (status === null) {
        params.delete(STATUS_PARAM);
      } else {
        params.set(STATUS_PARAM, status);
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams],
  );

  const clearFilter = useCallback(() => {
    updateStatus(DEFAULT_STATUS);
  }, [updateStatus]);

  return {
    selectedStatus,
    updateStatus,
    clearFilter,
  };
}

function isValidJobStatus(status: string): status is JobStatus {
  return Object.values(JobStatus).includes(status as JobStatus);
}
