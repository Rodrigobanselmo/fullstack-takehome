import {
  type CreateJobInput,
  type JobStatus as GraphQLJobStatus,
  type Job,
  type UpdateJobInput,
} from "generated/gql/graphql";
import { type JobStatus } from "generated/prisma";
import { prisma } from "~/server/database/prisma";
import { JobNotFoundError } from "./job.errors";

export async function getUserJobs({
  userId,
  filter,
}: {
  userId: string;
  filter: {
    status?: GraphQLJobStatus | null;
  };
}): Promise<Job[]> {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      deletedAt: null,
      OR: [{ contractorId: userId }, { homeownerId: userId }],
      ...(filter.status && { status: filter.status }),
    },
    include: {
      contractor: true,
      homeowner: true,
    },
  });

  const formattedJobs = jobs.map((job) => ({
    ...job,
    status: job.status as GraphQLJobStatus,
    cost: job.cost.toNumber(),
  }));

  return formattedJobs;
}

export async function getUserJobById({
  userId,
  jobId,
}: {
  userId: string;
  jobId: string;
}): Promise<Job> {
  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      deletedAt: null,
      OR: [{ contractorId: userId }, { homeownerId: userId }],
    },
    include: {
      contractor: true,
      homeowner: true,
    },
  });
  if (!job) throw JobNotFoundError();

  return {
    ...job,
    status: job.status as GraphQLJobStatus,
    cost: job.cost.toNumber(),
  };
}

export async function createJobWithConversation({
  contractorId,
  input,
}: {
  contractorId: string;
  input: CreateJobInput;
}) {
  const homeownerId = input.homeownerId;
  const result = await prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        cost: input.cost,
        description: input.description,
        location: input.location,
        status: input.status as JobStatus,
        contractorId,
        homeownerId,
      },
    });

    const existingConversation = await tx.conversation.count({
      where: { contractorId, homeownerId },
    });

    if (existingConversation === 0) {
      await tx.conversation.create({
        data: { contractorId, homeownerId },
      });
    }

    return job.id;
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
  const existingJob = await prisma.job.count({
    where: { id: jobId, contractorId, deletedAt: null },
  });
  if (existingJob === 0) throw JobNotFoundError();

  await prisma.job.update({
    where: { id: jobId },
    data: {
      description: input.description,
      location: input.location,
      status: input.status as JobStatus,
      cost: input.cost,
      homeownerId: input.homeownerId,
    },
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
  const existingJob = await prisma.job.count({
    where: { id: jobId, contractorId, deletedAt: null },
  });

  if (existingJob === 0) throw JobNotFoundError();

  await prisma.job.update({
    where: { id: jobId },
    data: { deletedAt: new Date() },
  });
  return jobId;
}
