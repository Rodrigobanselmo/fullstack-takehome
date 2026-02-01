import {
  type Job,
  type MutationCreateJobArgs,
  type MutationDeleteJobArgs,
  type MutationUpdateJobArgs,
  type QueryJobArgs,
  type QueryJobsArgs,
} from "generated/gql/graphql";
import { canManageJob, canViewJobs } from "./job.auth";
import { schemaValidation } from "~/lib/validation";
import type { GraphQLContext } from "../context";
import { InvalidInputError, UnauthorizedError } from "../errors";
import {
  createJobWithConversation,
  deleteJobById,
  getUserJobById,
  getUserJobs,
  updateJobById,
} from "./job.services";
import {
  createJobInputSchema,
  idSchema,
  queryJobsArgsSchema,
  updateJobInputSchema,
} from "./job.validators";

export const jobResolvers = {
  Query: {
    jobs: async (
      _: unknown,
      args: QueryJobsArgs,
      context: GraphQLContext,
    ): Promise<Job[]> => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(queryJobsArgsSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      const { status } = validation.data;

      return getUserJobs({
        userId: context.user!.id,
        status: status,
      });
    },
    job: async (_: unknown, args: QueryJobArgs, context: GraphQLContext) => {
      const isUnauthorized = !canViewJobs(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(idSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }
      const { id } = validation.data;

      return getUserJobById({ userId: context.user!.id, jobId: id });
    },
  },
  Mutation: {
    createJob: async (
      _: unknown,
      args: MutationCreateJobArgs,
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(createJobInputSchema, args.input);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }

      return createJobWithConversation({
        contractorId: context.user!.id,
        input: validation.data,
      });
    },
    updateJob: async (
      _: unknown,
      args: MutationUpdateJobArgs,
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const inputValidation = schemaValidation(updateJobInputSchema, args);
      if (inputValidation.success === false) {
        throw InvalidInputError(inputValidation.error);
      }

      const { id, input } = inputValidation.data;

      return updateJobById({
        userId: context.user!.id,
        jobId: id,
        input,
      });
    },
    deleteJob: async (
      _: unknown,
      args: MutationDeleteJobArgs,
      context: GraphQLContext,
    ): Promise<string> => {
      const isUnauthorized = !canManageJob(context.user);
      if (isUnauthorized) {
        throw UnauthorizedError();
      }

      const validation = schemaValidation(idSchema, args);
      if (validation.success === false) {
        throw InvalidInputError(validation.error);
      }
      const { id } = validation.data;

      return deleteJobById({
        userId: context.user!.id,
        jobId: id,
      });
    },
  },
};
