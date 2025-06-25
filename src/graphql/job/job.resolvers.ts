import {
  type CreateJobInput,
  type UpdateJobInput,
  type QueryJobArgs,
  type QueryJobsArgs,
  type Job,
} from "generated/gql/graphql";
import { canManageJob, canViewJobs } from "~/lib/authorization";
import type { GraphQLContext } from "../context";
import { UnauthorizedError } from "../errors";
import {
  getUserJobs,
  getUserJobById,
  createJobWithConversation,
  updateJobById,
  deleteJobById,
} from "./job.services";

export const jobResolvers = {
  Query: {
    jobs: async (
      _: unknown,
      { status }: QueryJobsArgs,
      context: GraphQLContext,
    ): Promise<Job[]> => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return getUserJobs({ userId: context.user!.id, status });
    },
    job: async (_: unknown, { id }: QueryJobArgs, context: GraphQLContext) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return getUserJobById({ userId: context.user!.id, jobId: id });
    },
  },
  Mutation: {
    createJob: async (
      _: unknown,
      { input }: { input: CreateJobInput },
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return createJobWithConversation({
        contractorId: context.user!.id,
        input,
      });
    },
    updateJob: async (
      _: unknown,
      { id, input }: { id: string; input: UpdateJobInput },
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return updateJobById({
        contractorId: context.user!.id,
        jobId: id,
        input,
      });
    },
    deleteJob: async (
      _: unknown,
      { id }: { id: string },
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      return deleteJobById({
        contractorId: context.user!.id,
        jobId: id,
      });
    },
  },
};
