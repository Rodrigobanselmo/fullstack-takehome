import {
  type CreateJobInput,
  type JobStatus as GraphQLJobStatus,
  type Job,
  type UpdateJobInput,
} from "generated/gql/graphql";
import { type JobStatus } from "generated/prisma";
import { jobRepository } from "~/server/repositories/job.repository";
import { JobNotContractorError, JobNotFoundError } from "./job.errors";

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
    status: (input.status || "planning") as JobStatus,
    contractorId,
    homeownerId,
  });
  return result;
}

export async function findJobAndVerifyManageAccess({
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

  if (job.contractor.id !== userId) {
    throw JobNotContractorError();
  }

  return job;
}

export async function updateJobById({
  userId,
  jobId,
  input,
}: {
  userId: string;
  jobId: string;
  input: UpdateJobInput;
}) {
  await findJobAndVerifyManageAccess({ userId, jobId });

  await jobRepository.updateById(jobId, {
    description: input.description,
    location: input.location,
    status: input.status ? (input.status as JobStatus) : undefined,
    cost: input.cost,
    homeownerId: input.homeownerId,
  });
  return jobId;
}

export async function deleteJobById({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}) {
  await findJobAndVerifyManageAccess({ userId, jobId });

  await jobRepository.softDeleteById(jobId);
  return jobId;
}
