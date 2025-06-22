import {
  type CreateJobInput,
  type UpdateJobInput,
} from "generated/gql/graphql";
import { type JobStatus, UserRole } from "generated/prisma";
import { canCreateJob, canViewJobs } from "~/lib/authorization";
import { prisma } from "~/server/database/prisma";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";

export const jobResolvers = {
  Query: {
    jobs: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return prisma.job.findMany({
        include: {
          homeowner: {
            select: {
              username: true,
              id: true,
            },
          },
        },
      });
    },
    job: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return prisma.job.findFirst({
        where: { id },
        include: {
          homeowner: {
            select: {
              username: true,
              id: true,
            },
          },
        },
      });
    },
    homeowners: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return prisma.user.findMany({
        where: {
          role: UserRole.HOMEOWNER,
        },
        select: {
          id: true,
          username: true,
        },
      });
    },
  },
  Mutation: {
    createJob: async (
      _: unknown,
      { input }: { input: CreateJobInput },
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canCreateJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      console.log(input);

      return prisma.job.create({
        data: {
          cost: input.cost,
          description: input.description,
          location: input.location,
          status: input.status as JobStatus,
          contractorId: context.user!.id,
          homeownerId: input.homeownerId,
        },
      });
    },
    updateJob: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateJobInput },
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canCreateJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      // Check if the job exists and belongs to the current contractor
      const existingJob = await prisma.job.findFirst({
        where: {
          id,
          contractorId: context.user!.id,
        },
      });

      if (!existingJob) {
        throw new Error(
          "Job not found or you don't have permission to edit it",
        );
      }

      return prisma.job.update({
        where: { id },
        data: {
          description: input.description,
          location: input.location,
          status: input.status as JobStatus,
          cost: input.cost,
          homeownerId: input.homeownerId || null,
        },
      });
    },
  },
};
