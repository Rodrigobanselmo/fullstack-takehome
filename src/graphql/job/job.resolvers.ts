import type { CreateJobInput } from "generated/gql/graphql";
import { type JobStatus } from "generated/prisma";
import { prisma } from "~/server/database/prisma";

export const jobResolvers = {
  Query: {
    jobs: async () => {
      return prisma.job.findMany({
        include: {
          homeowner: {
            select: {
              username: true,
            },
          },
        },
      });
    },
  },
  Mutation: {
    createJob: async (_: unknown, { input }: { input: CreateJobInput }) => {
      return prisma.job.create({
        data: {
          cost: input.cost,
          description: input.description,
          location: input.location,
          status: input.status as JobStatus,
          contractorId: input.contractorId,
          homeownerId: input.homeownerId,
        },
      });
    },
  },
};
