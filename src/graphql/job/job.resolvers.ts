import {
  type CreateJobInput,
  type UpdateJobInput,
} from "generated/gql/graphql";
import { type JobStatus, UserRole } from "generated/prisma";
import { canManageJob, canViewJobs } from "~/lib/authorization";
import { prisma } from "~/server/database/prisma";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import { JobNotFoundError } from "./job.errors";

export const jobResolvers = {
  Query: {
    jobs: async (_: unknown, __: unknown, context: GraphQLContext) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return prisma.job.findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          deletedAt: null,
        },
        include: {
          homeowner: {
            select: {
              name: true,
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

      const job = await prisma.job.findFirst({
        where: { id },
        include: {
          homeowner: {
            select: {
              name: true,
              id: true,
            },
          },
        },
      });

      if (!job) {
        throw JobNotFoundError();
      }

      return job;
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
          name: true,
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
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const job = await prisma.job.create({
        data: {
          cost: input.cost,
          description: input.description,
          location: input.location,
          status: input.status as JobStatus,
          contractorId: context.user!.id,
          homeownerId: input.homeownerId,
        },
      });

      return job.id;
    },
    updateJob: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateJobInput },
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const existingJob = await prisma.job.findFirst({
        where: {
          id,
          contractorId: context.user!.id,
          deletedAt: null,
        },
      });

      if (!existingJob) {
        throw JobNotFoundError();
      }

      await prisma.job.update({
        where: { id },
        data: {
          description: input.description,
          location: input.location,
          status: input.status as JobStatus,
          cost: input.cost,
          homeownerId: input.homeownerId,
        },
      });

      return id;
    },
    deleteJob: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ) => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const existingJob = await prisma.job.findFirst({
        where: {
          id,
          contractorId: context.user!.id,
          deletedAt: null,
        },
      });

      if (!existingJob) {
        throw JobNotFoundError();
      }

      await prisma.job.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return id;
    },
  },
};
