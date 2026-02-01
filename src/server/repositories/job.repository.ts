import { prisma } from "~/server/database/prisma";
import type { Job, JobStatus as GraphQLJobStatus } from "generated/gql/graphql";
import type { JobStatus } from "generated/prisma";

class PrismaJobRepository {
  async findManyByUserId(
    userId: string,
    filter: {
      status?: GraphQLJobStatus | null;
    },
  ): Promise<Job[]> {
    const jobs = await prisma.jobs.findMany({
      orderBy: { createdAt: "desc" },
      where: {
        deletedAt: null,
        OR: [{ contractorId: userId }, { homeownerId: userId }],
        ...(filter.status && { status: filter.status as JobStatus }),
      },
      include: {
        contractor: true,
        homeowner: true,
      },
    });

    return jobs.map((job) => ({
      ...job,
      status: job.status as GraphQLJobStatus,
      cost: job.cost.toNumber(),
    }));
  }

  async findByIdAndUserId(jobId: string, userId: string): Promise<Job | null> {
    const job = await prisma.jobs.findFirst({
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

    if (!job) {
      return null;
    }

    return {
      ...job,
      status: job.status as GraphQLJobStatus,
      cost: job.cost.toNumber(),
    };
  }

  async create(data: {
    cost: number;
    description: string;
    location: string;
    status: JobStatus;
    contractorId: string;
    homeownerId: string;
  }): Promise<Job> {
    const job = await prisma.jobs.create({
      data,
      include: {
        contractor: true,
        homeowner: true,
      },
    });

    return {
      ...job,
      status: job.status as GraphQLJobStatus,
      cost: job.cost.toNumber(),
    };
  }

  async updateById(
    jobId: string,
    data: {
      description?: string;
      location?: string;
      status?: JobStatus;
      cost?: number;
      homeownerId?: string;
    },
  ): Promise<Job> {
    const job = await prisma.jobs.update({
      where: { id: jobId },
      data,
      include: {
        contractor: true,
        homeowner: true,
      },
    });

    return {
      ...job,
      status: job.status as GraphQLJobStatus,
      cost: job.cost.toNumber(),
    };
  }

  async softDeleteById(jobId: string): Promise<Job> {
    const job = await prisma.jobs.update({
      where: { id: jobId },
      data: { deletedAt: new Date() },
      include: {
        contractor: true,
        homeowner: true,
      },
    });

    return {
      ...job,
      status: job.status as GraphQLJobStatus,
      cost: job.cost.toNumber(),
    };
  }

  async createWithConversation(data: {
    cost: number;
    description: string;
    location: string;
    status: JobStatus;
    contractorId: string;
    homeownerId: string;
  }): Promise<string> {
    const result = await prisma.$transaction(async (tx) => {
      const job = await tx.jobs.create({
        data: {
          cost: data.cost,
          description: data.description,
          location: data.location,
          status: data.status,
          contractorId: data.contractorId,
          homeownerId: data.homeownerId,
        },
      });

      const existingConversation = await tx.conversations.findFirst({
        where: {
          contractorId: data.contractorId,
          homeownerId: data.homeownerId,
        },
        select: { id: true },
      });

      if (!existingConversation) {
        await tx.conversations.create({
          data: {
            contractorId: data.contractorId,
            homeownerId: data.homeownerId,
          },
        });
      }

      return job.id;
    });

    return result;
  }
}

export const jobRepository = new PrismaJobRepository();
