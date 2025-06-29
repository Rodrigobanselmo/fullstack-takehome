import { prisma } from "~/server/database/prisma";
import type {
  Subtask,
  SubtaskStatus as GraphQLSubtaskStatus,
} from "generated/gql/graphql";
import type { SubtaskStatus } from "generated/prisma";

class PrismaSubtaskRepository {
  async findManyByJobId(jobId: string, userId: string): Promise<Subtask[]> {
    const subtasks = await prisma.subtask.findMany({
      where: {
        jobId,
        deletedAt: null,
        job: {
          contractorId: userId,
          deletedAt: null,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return subtasks.map((subtask) => ({
      ...subtask,
      status: subtask.status as GraphQLSubtaskStatus,
      cost: subtask.cost.toNumber(),
    }));
  }

  async findByIdAndJobId({
    subtaskId,
    jobId,
    userId,
  }: {
    subtaskId: string;
    jobId: string;
    userId: string;
  }): Promise<Subtask | null> {
    const subtask = await prisma.subtask.findFirst({
      where: {
        id: subtaskId,
        jobId,
        deletedAt: null,
        job: {
          contractorId: userId,
          deletedAt: null,
        },
      },
    });

    if (!subtask) {
      return null;
    }

    return {
      ...subtask,
      status: subtask.status as GraphQLSubtaskStatus,
      cost: subtask.cost.toNumber(),
    };
  }

  async create(data: {
    description: string;
    deadline: Date | null;
    cost: number;
    jobId: string;
    status: GraphQLSubtaskStatus;
  }): Promise<Subtask> {
    const subtask = await prisma.subtask.create({
      data: {
        ...data,
        status: data.status as SubtaskStatus,
      },
    });

    return {
      ...subtask,
      status: subtask.status as GraphQLSubtaskStatus,
      cost: subtask.cost.toNumber(),
    };
  }

  async updateByIdAndJobId(
    jobId: string,
    subtaskId: string,
    data: {
      description?: string;
      deadline?: Date | null;
      cost?: number;
      status?: GraphQLSubtaskStatus;
    },
  ): Promise<Subtask> {
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId, jobId },
      data: {
        ...data,
        status: data.status as SubtaskStatus,
      },
    });

    return {
      ...subtask,
      status: subtask.status as GraphQLSubtaskStatus,
      cost: subtask.cost.toNumber(),
    };
  }

  async softDeleteByIdAndJobId(
    jobId: string,
    subtaskId: string,
  ): Promise<Subtask> {
    const subtask = await prisma.subtask.update({
      where: { id: subtaskId, jobId },
      data: { deletedAt: new Date() },
    });

    return {
      ...subtask,
      status: subtask.status as GraphQLSubtaskStatus,
      cost: subtask.cost.toNumber(),
    };
  }
}

export const subtaskRepository = new PrismaSubtaskRepository();
