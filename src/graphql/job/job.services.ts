import {
  type CreateJobInput,
  type JobStatus as GraphQLJobStatus,
  type Job,
  type UpdateJobInput,
} from "generated/gql/graphql";
import { type JobStatus } from "generated/prisma";
import { prisma } from "~/server/database/prisma";
import { jobRepository } from "~/server/repositories/job.repository";
import { JobNotFoundError } from "./job.errors";

export async function getUserJobs({
  userId,
  status,
}: {
  userId: string;
  status?: GraphQLJobStatus | null;
}): Promise<Job[]> {
  return jobRepository.findManyByUserId(userId, { status });
}

export async function getUserJobById({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}): Promise<Job> {
  const job = await jobRepository.findByIdAndUserId(jobId, userId);
  if (!job) {
    throw JobNotFoundError();
  }

  return job;
}

export async function createJobWithConversation({
  contractorId,
  input,
}: {
  contractorId: string;
  input: CreateJobInput;
}) {
  const homeownerId = input.homeownerId;
  const result = await jobRepository.createWithConversation({
    cost: input.cost,
    description: input.description,
    location: input.location,
    status: input.status as JobStatus,
    contractorId,
    homeownerId,
  });
  return result;
}

export async function updateJobById({
  contractorId,
  jobId,
  input,
}: {
  contractorId: string;
  jobId: string;
  input: UpdateJobInput;
}) {
  const hasAccess = await jobRepository.contractorHasJobAccess(
    jobId,
    contractorId,
  );
  if (!hasAccess) {
    throw JobNotFoundError();
  }

  await jobRepository.updateById(jobId, {
    description: input.description,
    location: input.location,
    status: input.status as JobStatus,
    cost: input.cost,
    homeownerId: input.homeownerId,
  });
  return jobId;
}

export async function deleteJobById({
  contractorId,
  jobId,
}: {
  contractorId: string;
  jobId: string;
}) {
  const hasAccess = await jobRepository.contractorHasJobAccess(
    jobId,
    contractorId,
  );
  if (!hasAccess) {
    throw JobNotFoundError();
  }

  await jobRepository.softDeleteById(jobId);
  return jobId;
}
